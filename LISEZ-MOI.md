# Kroma : le logiciel de production motion du studio

Un seul outil pour suivre chaque projet de bout en bout, organisé autour de notre workflow :

1. **Projet & timeline** (`projet.html`) : fiche projet (client, type, brief, budget, deadline, dossier Drive) et Gantt des 6 étapes, avec dates proposées et alerte en cas de retard.
2. **Moodboard** (`moodboard.html`) : références, dossiers clients, descriptions IA. Partagé entre associés via Supabase, chaque projet a son dossier.
3. **Storyboard** (`storyboard.html`) : plans (image, texte ou voix off, durée), durée totale, commentaires par plan, lien de partage client.
4. **Production** (`production.html`) : tâches par scène, assignées, avec statut et chrono.
5. **Review** (`review.html`) : la review vidéo façon Frame.io (versions, commentaires au timecode, dessins, liens client).
6. **Stockage** (`stockage.html`) : liens Google Drive des fichiers finaux et des sources, et archive du projet.

Autour : l'**accueil** (`index.html`), la liste des **Projets** (`projets.html`), la **Timeline** de tous les projets (`timeline.html`) et les **Assets** (`stockage.html` sans projet). Chaque étape a un bouton **Valider l'étape** qui fait passer le projet à la suivante.

Le site est fait de fichiers simples (HTML, CSS et JavaScript, sans framework ni compilation) : `styles.css` porte le design system commun et `app.js` la navigation, la connexion et l'accès aux données. Les données sont gérées par **Supabase** (offre gratuite).

## Passer de la v1 à la v2 (si la base existe déjà)

1. Dans Supabase : **SQL Editor → New query**, colle tout `supabase/migration-v2.sql`, puis **Run**. Le message doit être « Success ». Le script ajoute ce qu'il faut sans toucher aux projets, vidéos et commentaires existants, et peut être relancé sans risque.
2. Facultatif : pour que l'accueil vous salue par votre prénom, lance aussi (avec vos vrais e-mails) :
   ```sql
   update public.studio_members set name = 'Ilyane' where email = 'ton@email.com';
   ```
3. Mets le site à jour. À la première ouverture du Moodboard, les références enregistrées dans ton navigateur sont ajoutées automatiquement au moodboard partagé.

**Lance la migration avant de mettre la v2 en ligne.** Sans elle, un bandeau le rappelle en haut de chaque page, et la Review continue de fonctionner normalement.

---

## Première installation

Compte environ 20 minutes pour la mise en place. Tu ne la fais qu'une fois.

---

## 1. Créer la base Supabase

1. Crée un compte gratuit sur **supabase.com**, puis **New project**.
   - Nom : `kroma`
   - Région : **West EU (Paris)**
   - Mot de passe de la base : génère-le et garde-le de côté (tu n'en auras pas besoin au quotidien).
2. Attends 1 à 2 minutes que le projet soit prêt.

## 2. Créer vos deux comptes studio

1. Menu de gauche : **Authentication → Users → Add user → Create new user**.
2. Mets ton e-mail et un mot de passe, et coche **Auto Confirm User**.
3. Recommence pour ton associé.
4. Toujours dans Authentication, ouvre **Sign In / Providers** et **désactive « Allow new users to sign up »**. Ainsi, personne d'autre ne peut créer de compte.

## 3. Installer la base de données

1. Ouvre le fichier `supabase/schema.sql` dans un éditeur de texte.
2. Tout en bas, remplace `toi@tondomaine.com` et `associe@tondomaine.com` par **vos deux vrais e-mails**, ceux de l'étape 2.
3. Dans Supabase : **SQL Editor → New query**, colle tout le fichier, puis **Run**.
4. Le message doit être « Success ». Le script crée les tables, les règles de sécurité et le dossier de stockage des vidéos. Tu peux le relancer sans risque.
5. Lance ensuite `supabase/migration-v2.sql` de la même façon (projets, storyboard, production, stockage, moodboard partagé).

Pour ajouter quelqu'un au studio plus tard : crée son compte (étape 2), puis lance dans le SQL Editor :

```sql
insert into public.studio_members (email) values ('nouveau@tondomaine.com');
```

## 4. Relier le site à Supabase

1. Dans Supabase, clique sur **Connect** en haut (ou **Project Settings → API Keys**).
2. Copie :
   - le **Project URL** (du type `https://abcd1234.supabase.co`) ;
   - la **Publishable key** (elle commence par `sb_publishable_`). Si tu ne vois que l'ancienne « anon key », elle marche aussi.
3. Ouvre `config.js` et colle ces deux valeurs à la place des `XXXX`.

Ces deux valeurs sont faites pour être publiques : c'est la base elle-même qui bloque tout accès non autorisé. **Ne mets jamais la « secret key » ou la « service_role key » dans ce fichier.**

## 5. Mettre le site en ligne

Le site marche sur n'importe quel hébergeur de sites statiques. Aujourd'hui, il est publié par **GitHub Pages** depuis la branche `main` du dépôt : chaque modification poussée sur `main` part directement en ligne.

> **Attention, Vercel gratuit (Hobby) est réservé à un usage personnel et non commercial.** Pour un outil de studio qui sert à des clients, il faut normalement le plan Pro de Vercel (payant). Si tu veux rester à 0 €, Netlify ou Cloudflare Pages acceptent un usage commercial sur leur offre gratuite.

**Option A : Netlify (la plus simple, gratuite).**
Crée un compte sur netlify.com, ouvre **app.netlify.com/drop** et glisse le dossier `kroma-app` entier. Le site est en ligne en quelques secondes. Pour le mettre à jour, glisse à nouveau le dossier dans **Deploys** de ton site.

**Option B : Vercel.**
1. Crée un dépôt sur github.com (privé), puis **Add file → Upload files** et glisse tout le contenu du dossier.
2. Sur vercel.com : **Add New → Project**, importe le dépôt, laisse « Framework Preset » sur **Other**, puis **Deploy**.

## 6. Autoriser les liens de mot de passe

Dans Supabase : **Authentication → URL Configuration**.
- **Site URL** : l'adresse de ton site (ex. `https://ton-site.netlify.app`).
- **Redirect URLs** : ajoute `https://ton-site.netlify.app/**`.

Ensuite, sur l'écran de connexion, mets ton e-mail et clique sur **Créer ou réinitialiser mon mot de passe**. Tu reçois un lien par e-mail, qui te ramène sur le site pour choisir ton mot de passe. Ça sert aussi en cas d'oubli.

Si l'e-mail n'arrive pas (le service gratuit de Supabase n'envoie que quelques e-mails par heure), crée le mot de passe directement dans **SQL Editor** :

```sql
update auth.users
set encrypted_password = extensions.crypt('TON_MOT_DE_PASSE', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'ton@email.com';
```

## 7. Utiliser la Review

- Va sur `ton-site/review.html` et connecte-toi.
- **Nouveau projet** → **Importer une vidéo** (ou glisse le fichier sur la page).
- Dans le lecteur :
  - **Espace** : lecture et pause.
  - **← / →** : image par image.
  - **Maj + ← / →** : une seconde.
  - Commentaire calé au timecode, bouton **Dessiner** pour annoter l'image, réponses, « Marquer comme réglé », statut (En revue / À corriger / Validée).
- **Partager** donne un lien à envoyer au client. Il peut regarder, commenter (avec son prénom), dessiner, puis **Valider la vidéo** ou **Demander des modifs**, sans créer de compte. Tes commentaires arrivent en direct de ton côté.
- **Nouvelle version** ajoute une V2, V3… sur le même lien. Le client voit toujours la dernière, et peut revenir aux anciennes.

## Limites de l'offre gratuite Supabase

- **50 Mo maximum par vidéo** : exporte des previews en MP4 H.264, 1080p, 4 à 6 Mbit/s. Une minute pèse alors environ 30 à 45 Mo.
- **1 Go de stockage au total** : supprime les vieux projets de temps en temps.
- **5 Go de bande passante par mois** : environ 150 visionnages d'une vidéo de 30 Mo.
- **Un projet gratuit se met en pause après une semaine sans aucune activité.** Il suffit de le réactiver depuis le tableau de bord Supabase.

## Utiliser le workflow

- **Créer un projet** : sur l'accueil, tape « Nom du projet / Client » dans la grande barre, choisis le type (Motion 2D, 3D, Packshot, Tournage) ou un template avec le **+**, puis la flèche. Le planning des 6 étapes est proposé selon le type ; ajuste-le dans **Projet & timeline**. Le bouton **Nouveau projet** de la barre latérale ouvre la version détaillée.
- **Timeline** : la pastille « deadlines cette semaine » en haut ouvre la vue de tous les projets, avec la semaine en cours jour par jour. Une étape qui dépasse sa date de fin est signalée en rouge.
- **Notifications** (cloche) : nouveaux commentaires clients (review et storyboard), versions validées ou à corriger.
- **Storyboard** : ajoute des plans, glisse ou colle une image (JPG, PNG, WebP, GIF, 10 Mo maximum), écris l'action ou la voix off, règle la durée. **Partager au client** donne un lien pour commenter chaque plan sans compte.
- **Production** : découpe en scènes, ajoute les tâches, assigne-les. Clique sur le statut pour le faire avancer. Le chrono s'arrête tout seul quand la tâche passe à « Fait ».
- **Stockage** : rien n'est envoyé sur le serveur, on garde les liens Google Drive (masters, sources, éléments de DA). L'**archive du projet** regroupe brief, moodboard, storyboard, versions et retours. Une fois le projet livré, **Archiver le projet** le range dans l'onglet Archivés.

## Moodboard partagé

Le moodboard est enregistré dans Supabase : toi et ton associé voyez les mêmes références et les mêmes dossiers. Il garde aussi une copie dans le navigateur, pour s'afficher tout de suite.

- Le **+** du dock permet d'**importer** un fichier JSON (export d'une ancienne version comprise) ou d'**exporter** tout le moodboard en JSON.
- Ouvert depuis un projet, le moodboard affiche directement le dossier du projet (créé automatiquement au premier passage).
- La clé OpenRouter des descriptions IA reste propre à chaque navigateur.
