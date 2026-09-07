# 123Finances

Pilotez vos finances personnelles, construit avec **Expo / React Native**. Un
seul code source pour **iOS, Android, Web** et le **bureau (Linux, macOS,
Windows)** via Electron. **100 % local** : aucun compte, aucun serveur, vos
données ne quittent jamais votre appareil.

## Ce que fait l'app

- **Comptes** — courant, épargne, espèces… autant que nécessaire, avec solde
  initial (négatif si découvert) et suivi du solde en direct.
- **Transactions** — dépenses et revenus, classées par catégorie, compte, date
  et note. Navigation mois par mois, filtres, groupement par journée.
- **Budgets** — une limite mensuelle par catégorie de dépense, avec barre de
  progression et alerte de dépassement, mise à jour à chaque transaction.
- **Tableau de bord** — solde consolidé, flux du mois, répartition des
  dépenses par catégorie et dernières transactions.
- **Catégories** — 13 fournies (alimentation, logement, transport…) et vos
  catégories personnalisées.
- **Export CSV** des transactions, réinitialisation complète — toujours en un
  appui, toujours chez vous.

Les montants sont stockés en **centimes entiers** : aucun arrondi flottant,
l'affichage est toujours exact.

## 1. Démarrage

```bash
pnpm install
pnpm start                 # serveur de développement Expo
```

| Commande                           | Effet                                               |
| ---------------------------------- | --------------------------------------------------- |
| `pnpm start`                       | Serveur Expo (QR code, choix de la plateforme)      |
| `pnpm run android` / `ios` / `web` | Lance directement sur une plateforme                |
| `pnpm run desktop:dev`             | Expo web + fenêtre Electron en rechargement à chaud |
| `pnpm run verify`                  | `typecheck` + `lint` + `format:check` avant commit  |

## 2. Qualité de code

ESLint en _flat config_ ([eslint.config.js](eslint.config.js)) au-dessus de
`eslint-config-expo`, avec Prettier branché en fin de chaîne.

```bash
pnpm run lint          # 0 erreur attendue
pnpm run lint:fix
pnpm run format        # Prettier sur tout le dépôt
pnpm run typecheck     # tsc --noEmit
pnpm run verify        # typecheck + lint + format:check
```

Points de configuration notables :

- `desktop/` et `scripts/` sont traités comme du CommonJS Node, pas du TypeScript.
- `react/no-unescaped-entities` est désactivé : l'interface est en français et les
  apostrophes dans les textes sont normales.

Le workflow [`ci.yml`](.github/workflows/ci.yml) rejoue `typecheck`, `lint` et
`format:check` sur chaque push et PR. Les hooks Husky (`.husky/`) rejouent la
même vérification en local : `lint-staged` au commit, vérification complète au
push.

## 3. Desktop (Electron)

Le bundle web Expo est servi au processus Electron via `scripts/build-desktop.js`,
avec un schéma `app://` en production (voir `desktop/main.js`).

```bash
pnpm run desktop:build          # build de la plateforme courante
pnpm run desktop:build:win      # Windows uniquement (nsis)
pnpm run desktop:release        # build + publication GitHub Releases
```

## 4. Releases

Taguer un commit (`git tag v0.1.0 && git push --tags`) déclenche le workflow
[`release-desktop.yml`](.github/workflows/release-desktop.yml) : vérification,
puis installateurs Linux (AppImage/deb), macOS (dmg, non signé sans
certificat) et Windows (NSIS), publiés sur GitHub Releases. Les mises à jour
in-app (electron-updater) lisent ce même flux.

## 5. Architecture

```
app/            Écrans expo-router : (tabs)/, transaction-editor, account-editor
components/     ui/ (primitives) + feature/ (cartes métier)
contexts/       Finance (comptes, catégories, transactions), Budgets
services/       money.ts (centimes ↔ euros), platform.ts, storage.ts
constants/      theme.ts (palette Synapse), config.ts
desktop/        Processus principal + preload Electron
types/          Modèle de données partagé
```

Données persistées en local (`AsyncStorage`) : `finances.accounts`,
`finances.categories`, `finances.transactions`, `finances.budgets`.
