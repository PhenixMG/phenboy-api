# ✨ Phenboy API

**API REST construite avec Express + Sequelize pour gérer un bot Discord avec plusieurs modules :**  
Salons personnalisés, système de niveaux, logs de modération, statistiques de membres, et intégration The Division 2.

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 18
- MySQL (ou SQLite pour les tests)

### Installation

```bash
npm install
```

### Configuration

Copiez `.env.example` et renommez-le en `.env` :

```bash
cp .env.example .env
```

Modifiez les variables nécessaires (`JWT_SECRET`, `DISCORD_CLIENT_ID`, etc.)

### Lancer en développement

```bash
npm run dev
```

---

## 📂 Structure du projet

| Dossier         | Rôle                                                 |
|----------------|------------------------------------------------------|
| `controllers/` | Logique métier (handlers d'API)                      |
| `models/`      | Modèles Sequelize (relations, entités BDD)           |
| `routes/`      | Routes Express (REST API)                            |
| `middlewares/` | Middleware d'authentification, gestion d’erreurs...  |
| `cron/`        | Tâches récurrentes (ex : snapshot membres)           |
| `tests/`       | Tests unitaires et d’intégration                     |

---

## 🔐 Authentification

- Système OAuth2 avec Discord
- JWT (AccessToken & RefreshToken)
- Cookie HTTPOnly sécurisé pour le refresh

---

## 🧩 Modules inclus

- **Salons personnalisés** (`log`, `welcome`, `goodbye`, `announcement`)
- **Niveaux XP** : classement, top 10, reset, upsert
- **Modération** : logs des actions (`ban`, `mute`, `kick`, `warn`)
- **Statistiques** : membres par jour avec historique
- **The Division 2** : activités, incursions, blacklist, configuration

---

## 🧪 Lancer les tests

```bash
npm test
```

---

## 📘 Swagger UI

Accessible à :  
👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛣️ Roadmap (à venir)

- [ ] Pagination des résultats
- [ ] Gestion des rôles Discord (mod/admin)
- [ ] Webhooks pour interactions temps réel
- [ ] Stats avancées côté utilisateur

---

> Made with ❤️ by admins, for admins.
