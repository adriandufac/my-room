import React, { useState } from "react";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if we're in development mode
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        // Mock successful submission in development
        console.log("[CONTACT] Development mode - mocking form submission:", formData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
        }, 2000);
        return;
      }

      // Production: actual Netlify form submission
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          ...formData,
        }).toString(),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
        }, 2000);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("[CONTACT] Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#f0f0f0",
          border: "2px solid #4a5568",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            background: "linear-gradient(to bottom, #4a5568, #2d3748)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px 6px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          <span>Contact the Developer</span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#e53e3e",
              color: "white",
              border: "1px solid #c53030",
              borderRadius: "3px",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div style={{ padding: "20px" }}>
          {submitStatus === "success" ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#38a169",
                fontSize: "14px",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>✓</div>
              Message sent successfully!
              <br />
              Thank you for your feedback.
            </div>
          ) : (
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Hidden fields for Netlify */}
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" />

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#2d3748",
                  }}
                >
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "2px inset #d0d0d0",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                    backgroundColor: "white",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#2d3748",
                  }}
                >
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "2px inset #d0d0d0",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                    backgroundColor: "white",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#2d3748",
                  }}
                >
                  Message:
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "2px inset #d0d0d0",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                    backgroundColor: "white",
                    resize: "vertical",
                  }}
                />
              </div>

              {submitStatus === "error" && (
                <div
                  style={{
                    color: "#e53e3e",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  Error sending message. Please try again.
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 16px",
                    border: "2px outset #d0d0d0",
                    backgroundColor: "#f0f0f0",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    border: "2px outset #d0d0d0",
                    backgroundColor: isSubmitting ? "#ccc" : "#0078d4",
                    color: "white",
                    fontSize: "12px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};