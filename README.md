# pos-system

## How to run this Project ?

Clone this repo:

```bash
https://github.com/jahidrony037/pos-system.git
```

cd pos-system

run this index.html file

# 🛒 Offline POS System

A modern, fully offline Point of Sale (POS) system built with **vanilla JavaScript**, **IndexedDB**, and **CSS Cascade Layers**. No frameworks, no backend, no internet required — all data is stored locally in your browser.

---

## 📋 Summary

A lightweight, production-ready POS system that runs entirely in the browser with zero dependencies. Perfect for small businesses, pop-up shops, offline markets, or learning modern web development practices.

### 🎯 Key Highlights

| Feature                      | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| **100% Offline**             | No internet required — all data stored in IndexedDB         |
| **Zero Dependencies**        | Pure vanilla JavaScript, HTML, CSS — no frameworks          |
| **Modern Architecture**      | CSS Cascade Layers (`@layer`), ES6 modules, component-based |
| **Responsive Design**        | Works on desktop, tablet, and mobile devices                |
| **Drag & Drop UI**           | Rearrange interface panels to your preference               |
| **Theme Support**            | Dark/Light themes with persistent preference                |
| **Stock Management**         | Real-time inventory tracking with auto-deduction            |
| **Multiple Payment Methods** | Cash, MFS (Mobile Financial Service), Card, Bank            |
| **Sales History**            | Complete purchase records with expandable details           |
| **Data Export**              | Export sales data as JSON for backup/analysis               |

---

## ✨ Features

### 🛍️ Sales & Transactions

- ✅ **Real-time Shopping Cart** — Add/remove items with live total calculation
- ✅ **Smart Product Selection** — Auto-populate price, show stock status
- ✅ **Quantity Control** — Stepper buttons (+/-) for easy input
- ✅ **Payment Processing** — Complete sales with customer info and payment details
- ✅ **Multiple Payment Methods** — Cash, MFS, Card, Bank with visual selection
- ✅ **Due/Change Calculation** — Automatic balance calculation with color-coded indicators
- ✅ **Transaction Confirmation** — Review modal before finalizing sale

### 📦 Inventory Management

- ✅ **Product CRUD** — Create, Read, Update, Delete products
- ✅ **Stock Tracking** — Real-time inventory with color-coded badges:
  - 🟢 In Stock (5+ units)
  - 🟡 Low Stock (1-4 units)
  - 🔴 Out of Stock (0 units)
- ✅ **Automatic Stock Deduction** — Inventory updates instantly after sale
- ✅ **Product Search** — Fast filtering by name or description
- ✅ **Stock Validation** — Prevents overselling with quantity checks

### 📊 Reports & Analytics

- ✅ **Sales Dashboard** — Key metrics at a glance:
  - 💰 Total Revenue
  - 📋 Total Sales Count
  - 🔖 Total Items Sold
  - ⏳ Total Outstanding Due
- ✅ **Purchase History** — Expandable transaction records with full details
- ✅ **Customer Information** — Track sales by customer name
- ✅ **Date & Time Stamps** — Precise transaction tracking
- ✅ **Data Export** — Download sales data as JSON for external analysis

### 💾 Data Persistence

- ✅ **IndexedDB Storage** — Browser-native database (no server needed)
- ✅ **Persistent Data** — Survives browser restarts and refreshes
- ✅ **LocalStorage Support** — Theme and UI preferences saved
- ✅ **No Data Loss** — All transactions permanently stored locally
- ✅ **Demo Data Seeding** — 8 sample products on first run

### 🎨 User Interface

- ✅ **Dark/Light Themes** — Toggle with persistent preference
- ✅ **Drag & Drop Panels** — Rearrange POS layout (left ⇄ right)
- ✅ **Toast Notifications** — Real-time feedback for all actions
- ✅ **Responsive Layout** — Adapts to desktop, tablet, mobile
- ✅ **Mobile Menu** — Collapsible sidebar for small screens
- ✅ **Smooth Animations** — Polished transitions and micro-interactions
- ✅ **Keyboard Navigation** — Full keyboard accessibility
- ✅ **ARIA Labels** — Screen reader friendly

### 🏗️ Technical Excellence

- ✅ **Zero Dependencies** — No npm packages, no build tools
- ✅ **ES6 Modules** — Clean import/export architecture
- ✅ **CSS Cascade Layers** — Modern `@layer` for predictable specificity
- ✅ **Component Architecture** — Modular CSS and JS files
- ✅ **Semantic HTML** — Proper heading hierarchy, landmarks
- ✅ **No Frameworks** — Pure vanilla JavaScript
- ✅ **Browser-Native APIs** — IndexedDB, LocalStorage, Drag & Drop
- ✅ **Performance Optimized** — Fast load times, smooth 60 FPS rendering

### 🔒 Security & Privacy

- ✅ **Client-Side Only** — No server, no data transmission
- ✅ **Local Storage** — All data stays in your browser
- ✅ **No Tracking** — Zero analytics or external scripts
- ✅ **No Authentication** — Single-user system (add auth if needed)

---

## 📁 Project Structure

```
offline-pos/
├── index.html              # Main HTML entry point
├── css/
│   ├── style.css           # 🎯 Main CSS (imports all others)
│   ├── variables.css       # Design tokens & CSS custom properties
│   ├── base.css            # Reset, utilities (@layer base)
│   ├── responsive.css      # Media queries (@layer responsive)
│   └── components/         # Modular component styles
│       ├── header.css      # @layer components.header
│       ├── sidebar.css     # @layer components.sidebar
│       ├── buttons.css     # @layer components.buttons
│       ├── forms.css       # @layer components.forms
│       ├── cards.css       # @layer components.cards
│       ├── modals.css      # @layer components.modals
│       ├── pos-grid.css    # @layer components.pos-grid
│       ├── tables.css      # @layer components.tables
│       ├── purchase-list.css
│       ├── toast.css
│       └── utilities.css
└── js/
    ├── app.js              # Main entry point & initialization
    ├── db.js               # IndexedDB abstraction layer
    ├── cart.js             # Shopping cart state & rendering
    ├── products.js         # Product CRUD & list management
    ├── pos.js              # Product selection form (New Sale)
    ├── payment.js          # Payment modal & sale completion
    ├── sales.js            # Purchase history & statistics
    ├── navigation.js       # Client-side routing
    ├── dragdrop.js         # HTML5 Drag & Drop for panels
    ├── theme.js            # Dark/Light theme management
    ├── toast.js            # Toast notification system
    └── utils.js            # Shared utility functions
```

---
