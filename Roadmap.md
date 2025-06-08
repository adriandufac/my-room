Roadmap du projet - Jeu de plateforme 2D

Phase 1 : Fondations du projet
Durée estimée : 1-2 jours
Étape 1.1 : Structure de base et configuration

Créer l'arborescence des dossiers
Configurer les types TypeScript de base
Définir les constantes du jeu
Créer les interfaces principales

Tests à effectuer :

✅ Vérifier que tous les dossiers sont créés
✅ Compiler le projet sans erreur TypeScript
✅ Importer les types dans un fichier test
✅ Vérifier que les constantes sont accessibles

Étape 1.2 : Canvas React de base

Créer le composant GameCanvas avec ref
Initialiser le contexte 2D
Afficher un rectangle de test

Tests à effectuer :

✅ Le canvas s'affiche dans le navigateur
✅ Les dimensions sont correctes (1200x600)
✅ Un rectangle coloré apparaît à l'écran
✅ Pas d'erreurs dans la console

Phase 2 : Moteur de jeu minimal
Durée estimée : 3-4 jours
Étape 2.1 : Boucle de jeu et rendu

Implémenter GameLoop avec requestAnimationFrame
Créer le système de rendu basique
Ajouter le calcul de deltaTime

Tests à effectuer :

✅ La boucle de jeu tourne à 60 FPS
✅ Le compteur de FPS s'affiche
✅ La boucle peut être mise en pause/reprise
✅ Pas de fuite mémoire après 5 minutes

Étape 2.2 : Système de vecteurs et physique de base

Créer la classe Vector2D
Implémenter la gravité simple
Ajouter les calculs de vélocité

Tests à effectuer :

✅ Un rectangle tombe vers le bas avec la gravité
✅ Les opérations vectorielles fonctionnent (addition, multiplication)
✅ La vitesse augmente progressivement en chute libre
✅ Les calculs sont fluides sans saccades

Étape 2.3 : Joueur basique

Créer la classe Player
Implémenter le mouvement horizontal
Ajouter le saut

Tests à effectuer :

✅ Le rectangle rouge (joueur) apparaît à l'écran
✅ Flèches gauche/droite : le joueur se déplace horizontalement
✅ Barre d'espace : le joueur saute
✅ Le joueur tombe avec la gravité
✅ Pas de saut infini (seulement quand au sol)

Phase 3 : Plateformes et collisions
Durée estimée : 2-3 jours
Étape 3.1 : Plateformes statiques

Créer la classe Platform
Afficher des rectangles colorés pour les plateformes
Implémenter les collisions joueur-plateforme

Tests à effectuer :

✅ Des rectangles verts (plateformes) apparaissent
✅ Le joueur s'arrête sur les plateformes
✅ Le joueur peut marcher sur les plateformes
✅ Le joueur peut sauter depuis les plateformes
✅ Pas de passage à travers les plateformes

Étape 3.2 : Détection de collisions précise

Améliorer le système de collision
Gérer les collisions par côtés (haut, bas, gauche, droite)
Corriger les bugs de collision

Tests à effectuer :

✅ Le joueur se pose correctement sur les plateformes
✅ Le joueur ne traverse pas les murs latéraux
✅ Le joueur ne passe pas à travers le plafond
✅ Pas de "collage" aux murs
✅ Les collisions sont fluides

Phase 4 : Caméra et niveau étendu
Durée estimée : 2 jours
Étape 4.1 : Système de caméra

Créer la classe Camera
Implémenter le suivi du joueur
Ajouter les limites de niveau

Tests à effectuer :

✅ La caméra suit le joueur horizontalement
✅ La caméra reste dans les limites du niveau
✅ Le mouvement de caméra est fluide
✅ Le joueur reste visible à l'écran
✅ Pas de tremblement de caméra

Étape 4.2 : Niveau étendu

Créer un niveau plus large que l'écran
Ajouter plusieurs plateformes
Implémenter les zones de départ et d'arrivée

Tests à effectuer :

✅ Le niveau fait 2400px de large
✅ Le joueur peut parcourir tout le niveau
✅ Multiple plateformes à différentes hauteurs
✅ Zone de départ (gauche) et d'arrivée (droite) visibles
✅ Le joueur peut atteindre la fin du niveau

Phase 5 : Ennemis et dangers
Durée estimée : 2-3 jours
Étape 5.1 : Ennemis basiques

Créer la classe Enemy
Implémenter le mouvement automatique
Ajouter les collisions joueur-ennemi

Tests à effectuer :

✅ Des rectangles rouge-orangé (ennemis) apparaissent
✅ Les ennemis se déplacent automatiquement
✅ Les ennemis font demi-tour aux bords des plateformes
✅ Contact avec ennemi : le joueur perd une vie
✅ Le joueur peut éliminer les ennemis en sautant dessus

Étape 5.2 : Projectiles

Créer la classe Projectile
Implémenter le mouvement des projectiles
Ajouter les collisions projectile-joueur

Tests à effectuer :

✅ Des carrés orange (projectiles) apparaissent
✅ Les projectiles se déplacent horizontalement
✅ Contact avec projectile : le joueur perd une vie
✅ Les projectiles disparaissent hors écran
✅ Pas d'accumulation de projectiles en mémoire

Phase 6 : Éditeur de niveaux - Interface de base
Durée estimée : 3-4 jours
Étape 6.1 : Structure de l'éditeur et format JSON

Définir les interfaces JSON dans utils/Types.ts (LevelData, ObjectData, etc.)
Créer le composant LevelEditor.tsx principal
Implémenter la grille de placement dans l'éditeur
Créer LevelPreview.tsx pour afficher le niveau en cours d'édition

Tests à effectuer :

✅ Structure JSON claire définie (plateformes, ennemis, spawn, exit)
✅ Grille visible sur le canvas d'édition
✅ Interface d'éditeur s'affiche sans erreur
✅ Canvas d'édition responsive et navigable
✅ Prévisualisation en temps réel du niveau

Étape 6.2 : Toolbar et sélection d'outils

Créer Toolbar.tsx avec les outils de placement
Implémenter la sélection d'objets (plateformes, ennemis, projectiles, spawn, exit)
Ajouter les icônes et visuels pour chaque type d'objet
Gérer l'état de l'outil sélectionné

Tests à effectuer :

✅ Toolbar avec icônes claires pour chaque objet
✅ Sélection d'outil change visuellement l'interface
✅ Curseur change selon l'outil sélectionné
✅ Interface intuitive et ergonomique
✅ Indication claire de l'outil actif

Étape 6.3 : Placement et suppression d'objets

Implémenter le clic pour placer des objets sur la grille
Ajouter le clic droit pour supprimer des objets
Créer la prévisualisation avant placement
Implémenter le magnétisme à la grille

Tests à effectuer :

✅ Clic gauche place l'objet sélectionné
✅ Clic droit supprime un objet existant
✅ Prévisualisation fantôme avant placement
✅ Objets se placent exactement sur la grille
✅ Impossible de placer des objets superposés

Phase 7 : Éditeur de niveaux - Fonctionnalités avancées
Durée estimée : 2-3 jours
Étape 7.1 : Gestion des niveaux

Créer LevelList.tsx pour lister les niveaux existants
Implémenter la sauvegarde de niveaux en JSON dans data/levels/custom/
Ajouter le chargement de niveaux existants dans l'éditeur
Créer la validation des niveaux (spawn et exit obligatoires)

Tests à effectuer :

✅ Liste des niveaux dans data/levels/ s'affiche
✅ Sauvegarde d'un niveau créé au format JSON
✅ Chargement d'un niveau existant dans l'éditeur
✅ Validation empêche la sauvegarde de niveaux invalides
✅ Noms de fichiers automatiques ou personnalisables

Étape 7.2 : Test en temps réel

Intégrer l'éditeur au système de jeu existant
Ajouter un bouton "Tester le niveau" dans l'éditeur
Permettre le retour à l'éditeur après test
Synchroniser les données entre éditeur et jeu

Tests à effectuer :

✅ Bouton "Test" lance le niveau en cours d'édition
✅ Le niveau se joue normalement avec toutes les mécaniques
✅ Retour fluide à l'éditeur après le test
✅ Modifications préservées après le test
✅ Pas de bugs de synchronisation entre les modes

Étape 7.3 : Export et import JSON

Finaliser le système d'export JSON depuis LevelGenerator.ts
Modifier LevelManager.ts pour lire les JSON de l'éditeur
Ajouter la possibilité d'importer des JSON externes
Créer des niveaux de démonstration avec l'éditeur

Tests à effectuer :

✅ Export JSON parfaitement structuré et valide
✅ JSON exporté peut être relu par le jeu
✅ Import de JSON externes fonctionne
✅ Niveaux créés sont sauvegardés de façon persistante
✅ Compatibilité entre JSON créés et système de jeu

Phase 8 : Système de lecture des niveaux JSON
Durée estimée : 2 jours
Étape 8.1 : Lecteur de niveaux pour le jeu

Modifier LevelManager.ts pour lire les JSON depuis data/levels/
Créer un système de sélection de niveau simple dans Game.tsx
Implémenter le chargement des niveaux créés avec l'éditeur
Ajouter la validation des JSON avant chargement

Tests à effectuer :

✅ Chargement automatique des niveaux depuis data/levels/custom/
✅ Sélection de niveau dans le jeu (simple dropdown ou liste)
✅ Niveaux créés dans l'éditeur se jouent parfaitement
✅ Gestion d'erreurs si JSON malformé
✅ Performance de chargement acceptable

Étape 8.2 : Finitions et optimisations

Optimiser les performances du jeu avec les niveaux JSON
Ajouter des raccourcis clavier pour l'éditeur (Ctrl+S, Delete, Échap)
Améliorer l'UX de l'éditeur pour le développement
Séparer complètement l'éditeur du jeu (composants indépendants)

Tests à effectuer :

✅ Performance stable du jeu avec niveaux JSON complexes
✅ Éditeur fluide et efficace pour le développement
✅ Aucune dépendance entre Game.tsx et LevelEditor.tsx
✅ Workflow de développement optimal (créer → exporter → tester)
✅ Pas de code d'éditeur dans le build de production

Tests finaux globaux
Tests de workflow de développement

✅ Créer un niveau dans l'éditeur → Sauvegarder → Changer vers Game.tsx → Tester
✅ Éditer un niveau existant → Modifier → Re-sauvegarder → Tester dans le jeu
✅ Export JSON parfait depuis l'éditeur vers data/levels/custom/
✅ Tous les types d'objets se comportent correctement dans les niveaux créés
✅ Workflow de développement efficace et rapide

Tests de séparation des composants

✅ LevelEditor.tsx fonctionne indépendamment de Game.tsx
✅ Game.tsx ne contient aucune référence à l'éditeur
✅ Éditeur accessible uniquement en développement
✅ Build de production ne contient pas l'éditeur
✅ Niveaux JSON chargés proprement dans le jeu final

Durée totale estimée : 3 semaines
Cette approche sépare complètement l'éditeur de développement du jeu final. L'éditeur sert uniquement à créer et exporter des niveaux JSON, que le jeu charge ensuite pour les joueurs.
