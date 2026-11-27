# Kroma : Moodboard + Review

Deux pages dans le même site :

- **index.html** : le moodboard (références, dossiers clients, descriptions IA).
- **review.html** : la review vidéo façon Frame.io (projets, versions, commentaires calés sur la timeline, dessins sur l'image, liens de partage pour les clients).

Le site est fait de fichiers simples, sans installation ni compilation. Les vidéos, les commentaires et les comptes sont gérés par **Supabase** (offre gratuite).

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

Le site marche sur n'importe quel hébergeur de sites statiques.

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

Ensuite, sur la page Review, mets ton e-mail et clique sur **Créer ou réinitialiser mon mot de passe**. Tu reçois un lien par e-mail, qui te ramène sur le site pour choisir ton mot de passe. Ça sert aussi en cas d'oubli.

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

## Récupérer ton moodboard actuel

Le moodboard en ligne démarre vide, parce que chaque adresse a sa propre mémoire dans le navigateur. Pour le récupérer :

1. Dans ton ancien fichier, clique sur **Exporter**.
2. Sur le site en ligne, clique sur **Importer** et choisis le fichier. Tes dossiers sont importés avec.
3. Recolle ta clé OpenRouter dans **IA**.

Le moodboard reste propre à chaque navigateur. La Review, elle, est partagée entre toi, ton associé et tes clients.
