# 🧪 Guide de Test - Connexion Wallet

## Prérequis

1. ✅ Project ID WalletConnect configuré dans `.env.local`
2. ✅ Application lancée avec `npm run dev`
3. ✅ Un wallet installé (MetaMask, Coinbase Wallet, etc.)

## Scénarios de Test

### 1️⃣ Test : Wallet Non Connecté

**Actions :**
1. Ouvrir http://localhost:3000
2. Cliquer sur "Launch App"
3. Observer le dashboard

**Résultats attendus :**
- ✅ Alerte jaune en haut : "Wallet non connecté"
- ✅ Carte WalletConnect avec bouton "Connect Wallet"
- ✅ Header avec bouton "Connect Wallet"
- ✅ Pas d'informations de balance affichées

---

### 2️⃣ Test : Connexion Wallet

**Actions :**
1. Cliquer sur "Connect Wallet" (n'importe lequel des boutons)
2. Choisir un wallet dans la modale
3. Approuver la connexion dans le wallet

**Résultats attendus :**
- ✅ Modale Web3Modal s'ouvre
- ✅ Liste des wallets disponibles affichée
- ✅ QR code visible (pour mobile)
- ✅ Connexion réussie
- ✅ Alerte jaune disparaît
- ✅ Adresse affichée (format court)
- ✅ Balance affichée
- ✅ Indicateur vert "Connecté"

---

### 3️⃣ Test : Mauvais Réseau

**Actions :**
1. Connecter le wallet sur Ethereum Mainnet (ou autre réseau)
2. Observer le dashboard

**Résultats attendus :**
- ✅ Alerte jaune apparaît : "Mauvais réseau"
- ✅ Message : "Veuillez basculer vers le réseau Base"
- ✅ Bouton "Basculer vers Base" visible
- ✅ Indicateur de réseau en jaune

**Actions supplémentaires :**
1. Cliquer sur "Basculer vers Base"

**Résultats attendus :**
- ✅ Demande de changement de réseau dans le wallet
- ✅ Après approbation, réseau change vers Base
- ✅ Alerte disparaît
- ✅ Indicateur devient vert

---

### 4️⃣ Test : Copier l'Adresse

**Actions :**
1. Wallet connecté
2. Cliquer sur l'icône de copie à côté de l'adresse

**Résultats attendus :**
- ✅ Icône change en checkmark vert
- ✅ Adresse copiée dans le presse-papier
- ✅ Après 2 secondes, icône redevient normale

---

### 5️⃣ Test : Changer de Wallet

**Actions :**
1. Wallet connecté
2. Cliquer sur "Changer de wallet"

**Résultats attendus :**
- ✅ Modale Web3Modal s'ouvre à nouveau
- ✅ Possibilité de choisir un autre wallet
- ✅ Connexion avec le nouveau wallet fonctionne

---

### 6️⃣ Test : Déconnexion

**Actions :**
1. Wallet connecté
2. Cliquer sur "Déconnecter"

**Résultats attendus :**
- ✅ Wallet se déconnecte
- ✅ Alerte jaune réapparaît
- ✅ Carte revient à l'état "Connect Wallet"
- ✅ Header affiche "Connect Wallet"
- ✅ Balance disparaît

---

### 7️⃣ Test : Bouton Header

**Actions :**
1. Cliquer sur le bouton wallet dans le header

**Résultats attendus :**
- ✅ Si non connecté : ouvre la modale
- ✅ Si connecté : ouvre la modale pour changer de wallet
- ✅ Affiche l'adresse courte quand connecté
- ✅ Point vert visible quand connecté

---

### 8️⃣ Test : Persistance

**Actions :**
1. Connecter le wallet
2. Rafraîchir la page (F5)

**Résultats attendus :**
- ✅ Wallet reste connecté
- ✅ Pas besoin de reconnecter
- ✅ Toutes les informations sont restaurées

---

### 9️⃣ Test : Mobile (Responsive)

**Actions :**
1. Ouvrir sur mobile ou réduire la fenêtre
2. Tester la connexion

**Résultats attendus :**
- ✅ Boutons bien dimensionnés
- ✅ QR code visible et scannable
- ✅ Interface adaptée à l'écran
- ✅ Pas de débordement

---

### 🔟 Test : Erreurs

**Test A : Project ID manquant**
1. Supprimer `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` de `.env.local`
2. Redémarrer l'app

**Résultats attendus :**
- ✅ Warning dans la console
- ✅ Bouton Connect Wallet peut ne pas fonctionner

**Test B : Rejet de connexion**
1. Cliquer sur Connect Wallet
2. Rejeter dans le wallet

**Résultats attendus :**
- ✅ Modale se ferme
- ✅ Reste sur l'état non connecté
- ✅ Pas d'erreur visible

**Test C : Rejet de changement de réseau**
1. Sur mauvais réseau
2. Cliquer sur "Basculer vers Base"
3. Rejeter dans le wallet

**Résultats attendus :**
- ✅ Alerte reste visible
- ✅ Pas d'erreur critique

---

## Checklist Complète

### Interface
- [ ] Alerte jaune visible quand non connecté
- [ ] Alerte disparaît quand connecté
- [ ] Bouton Connect Wallet visible et cliquable
- [ ] Modale Web3Modal s'ouvre correctement
- [ ] Liste des wallets affichée
- [ ] QR code visible

### Connexion
- [ ] Connexion réussie avec MetaMask
- [ ] Connexion réussie avec Coinbase Wallet
- [ ] Connexion réussie avec WalletConnect (mobile)
- [ ] Adresse affichée correctement
- [ ] Balance affichée
- [ ] Réseau affiché

### Réseau
- [ ] Détection du mauvais réseau
- [ ] Alerte mauvais réseau affichée
- [ ] Bouton "Basculer vers Base" fonctionne
- [ ] Changement automatique vers Base
- [ ] Indicateur de statut correct (vert/jaune)

### Actions
- [ ] Copier l'adresse fonctionne
- [ ] Changer de wallet fonctionne
- [ ] Déconnexion fonctionne
- [ ] Bouton header fonctionne

### Persistance
- [ ] Connexion persiste après refresh
- [ ] État restauré correctement

### Responsive
- [ ] Fonctionne sur desktop
- [ ] Fonctionne sur mobile
- [ ] Fonctionne sur tablette

---

## 🐛 Problèmes Connus et Solutions

### Problème : "Project ID not set"
**Solution :** Vérifier `.env.local` et redémarrer le serveur

### Problème : Wallet ne se connecte pas
**Solution :** 
1. Vérifier que le wallet est déverrouillé
2. Essayer de rafraîchir la page
3. Vider le cache du navigateur

### Problème : Mauvais réseau persiste
**Solution :**
1. Changer manuellement dans le wallet
2. Ou utiliser le bouton "Basculer vers Base"

### Problème : Balance ne s'affiche pas
**Solution :**
1. Vérifier que vous êtes sur Base
2. Attendre quelques secondes (chargement)
3. Rafraîchir la page

---

## ✅ Validation Finale

Avant de considérer le test complet :
- [ ] Tous les scénarios testés
- [ ] Aucune erreur console
- [ ] Interface fluide et réactive
- [ ] Expérience utilisateur agréable
- [ ] Documentation à jour

---

## 📊 Métriques de Succès

- **Temps de connexion** : < 5 secondes
- **Taux de réussite** : > 95%
- **Erreurs critiques** : 0
- **Satisfaction utilisateur** : ⭐⭐⭐⭐⭐

Bon test ! 🚀
