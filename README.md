# 📚 City Library — Book Search Application

City Library est une application web moderne permettant de rechercher, explorer et consulter des livres à partir de l’API **Open Library**.  
Elle propose une recherche rapide, une recherche avancée avec filtres, une pagination performante et une interface responsive.

---

## ✨ Fonctionnalités

### 🔍 Recherche
- Recherche rapide par mots-clés
- Recherche avancée avec filtres :
    - Titre
    - Auteur
    - Sujet / catégorie
    - Langue
    - Année de publication (intervalle)

### 📄 Résultats
- Affichage sous forme de cartes (cover, titre, auteur, année)
- Pagination (100 livres par page)
- Navigation fluide sans rechargement
- Gestion des états :
    - Chargement
    - Aucun résultat
    - Erreur API

### 🎨 Interface
- Design moderne et responsive
- Header avec recherche rapide
- Footer informatif
- Adapté mobile / tablette / desktop

---

## 🛠️ Stack technique

- **React** (TypeScript)
- **React Router**
- **Tailwind CSS**
- **Lucide Icons**
- **Open Library API**

---

## 📦 Installation

### Prérequis
- Node.js ≥ 18
- npm ou yarn

### Installation du projet

```bash
git clone https://github.com/{TON_USERNAME}/3WEBD.git
cd src/app
npm install
```

### Lancement du projet

```bash
npm run dev
```

### Test

````bash
npx cypress run --record --key 78d1bdf8-2449-4aae-aa7a-e1e17f72b0cf
````
