# Guide de mise en ligne — Riad Auto Luxe

Ce guide suppose que vous n'avez jamais publié de site. Aucune commande, aucun
logiciel à installer : tout se fait dans le navigateur.

## Ce qui est gratuit, et ce qui ne l'est pas

- **Hébergement du site : 100% gratuit, pour toujours.** On utilise GitHub
  Pages, le service d'hébergement gratuit de GitHub.
- **Adresse du site : gratuite si vous acceptez `riadautoluxe.github.io`**,
  fournie automatiquement par GitHub. Un nom de domaine personnalisé
  (`riadautoluxe.dz` ou `.com`) est optionnel et coûte quelques euros par an
  (voir étape 6) — il n'existe plus aujourd'hui de service sérieux offrant un
  vrai nom de domaine 100% gratuit (Freenom, qui le proposait autrefois, a
  fermé ce service en 2024). Vous pouvez démarrer avec l'adresse gratuite et
  ajouter un domaine personnalisé plus tard, sans rien reconstruire.

---

## Étape 1 — Créer un compte GitHub

1. Allez sur **github.com** → **Sign up**.
2. Choisissez un nom d'utilisateur simple (ex. `riadautoluxe`) — il apparaîtra
   dans l'adresse gratuite de votre site.
3. Confirmez votre email.

## Étape 2 — Créer le dépôt et déposer les fichiers

1. Cliquez sur le **+** en haut à droite → **New repository**.
2. Nom du dépôt : par exemple `riadautoluxe-site`.
3. Laissez-le en **Public**, ne cochez aucune case d'initialisation.
4. Cliquez **Create repository**.
5. Sur la page qui s'affiche, cliquez le lien **uploading an existing file**.
6. Glissez-déposez **tout le contenu** du dossier `riadautoluxe` (le contenu,
   pas le dossier lui-même : `index.html`, `assets/`, `admin/`, `robots.txt`,
   etc.) dans la zone d'upload.
7. Cliquez **Commit changes**.

## Étape 3 — Activer GitHub Pages

1. Dans le dépôt, allez dans **Settings** → **Pages** (menu de gauche).
2. Sous **Build and deployment** → **Source**, choisissez **Deploy from a
   branch**.
3. **Branch** : `main`, dossier `/ (root)` → **Save**.
4. Attendez 1 à 2 minutes. Rechargez la page : GitHub affiche l'adresse de
   votre site, du type `https://riadautoluxe.github.io/riadautoluxe-site/`.

Votre site est en ligne. Ouvrez l'adresse pour vérifier.

## Étape 4 — Mettre à jour l'adresse dans les fichiers

Le site contient quelques références à une adresse d'exemple
(`https://www.riadautoluxe.dz`) utilisée pour le référencement (balises
canonical, aperçus de partage, sitemap). Il faut la remplacer par votre
adresse réelle (celle de l'étape 3, ou votre domaine personnalisé si vous en
prenez un à l'étape 6).

Le plus simple, sans rien installer :

1. Depuis votre dépôt GitHub, appuyez sur la touche **`.`** du clavier (ou
   changez `github.com` en `github.dev` dans l'URL). Un éditeur de code
   s'ouvre dans le navigateur.
2. Ouvrez la recherche globale (icône loupe, ou `Ctrl+Shift+H` pour
   « rechercher-remplacer dans tous les fichiers »).
3. Recherchez : `https://www.riadautoluxe.dz`
4. Remplacez par votre adresse réelle (sans `/` à la fin), par exemple
   `https://riadautoluxe.github.io/riadautoluxe-site` ou votre futur domaine.
5. Cliquez **Replace All**, puis en haut à gauche **Source Control** → message
   de commit → **Commit & Push**.

## Étape 5 — Utiliser le tableau de bord admin

1. Ouvrez `admin/index.html` sur votre site en ligne (ex.
   `https://votre-adresse/admin/index.html`).
2. Créez un code d'accès à la première visite (reste mémorisé sur cet
   appareil uniquement — ce n'est pas une sécurité forte, ne partagez jamais
   ce lien publiquement).
3. Modifiez la flotte et les textes du site dans les onglets **Flotte** et
   **Contenu du site**.
4. Onglet **Publication** : pour publier directement, créez un token GitHub
   (les 4 étapes sont détaillées dans le dashboard lui-même) et cliquez
   **Publier les modifications**. Sans token, utilisez les boutons de
   téléchargement puis déposez les fichiers dans `assets/data/` via
   l'interface GitHub (comme à l'étape 2).

## Étape 6 (optionnel) — Domaine personnalisé

Deux options honnêtes, sans passer par des revendeurs qui affichent des prix
gonflés (certains facturent plus de 100€/an pour un `.dz`, à éviter) :

- **`.dz` officiel via NIC Algérie (nic.dz)** — environ 1000 DA/an. Nécessite
  un registre de commerce ou une existence légale en Algérie, dossier à
  déposer, activation en ~2 jours ouvrés. C'est la solution la moins chère et
  la plus légitime pour un `.dz`.
- **`.com` (ou autre) via un registrar classique** (Namecheap, OVH, etc.) —
  environ 8 à 15 $/an, activation immédiate, aucun document requis. Plus
  simple si vous n'avez pas encore de registre de commerce.

Une fois le domaine acheté :

1. Chez votre registrar, ajoutez ces enregistrements DNS :
   - 4 enregistrements **A** pointant vers `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Un enregistrement **CNAME** pour `www` pointant vers
     `riadautoluxe.github.io`
2. Dans GitHub → **Settings** → **Pages** → **Custom domain**, entrez votre
   domaine (ex. `www.riadautoluxe.dz`) → **Save**. GitHub crée automatiquement
   un fichier `CNAME` à la racine du dépôt.
3. Cochez **Enforce HTTPS** dès que l'option devient disponible (peut prendre
   quelques heures).
4. Refaites l'étape 4 (rechercher-remplacer) avec votre nouveau domaine.

## Sécurité — à retenir

- Le code d'accès du dashboard protège des visites accidentelles, pas d'une
  attaque sérieuse : ne partagez jamais le lien `/admin/` publiquement.
- Le token GitHub donne accès en écriture à votre dépôt : ne le partagez avec
  personne, ne le collez jamais ailleurs que dans le champ prévu du
  dashboard.
- Si un token est compromis, révoquez-le immédiatement depuis GitHub
  → **Settings** → **Developer settings** → **Personal access tokens**.
