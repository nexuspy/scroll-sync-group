# 🟩🟩 Scroll Sync Group 🟩🟩

<pre>
███████╗ ██████╗  ██████╗ ██╗         ██╗███████╗ ██████╗ 
██╔════╝██╔═══██╗██╔═══██╗██║         ██║██╔════╝██╔═══██╗
███████╗██║   ██║██║   ██║██║         ██║█████╗  ██║   ██║
╚════██║██║   ██║██║   ██║██║         ██║██╔══╝  ██║   ██║
███████║╚██████╔╝╚██████╔╝███████╗    ██║███████╗╚██████╔╝
╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝    ╚═╝╚══════╝ ╚═════╝ 
</pre>
---

A powerful utility to synchronize the scroll positions of multiple DOM elements. Immerse yourself in the Matrix of scrolling!

## 💻 Installation
```bash
npm install scroll-sync-group
```

## 🚀 Usage
Synchronize elements with ease.

```ts
import { addToScrollGroup } from 'scroll-sync-group';

addToScrollGroup(document.getElementById('left'), 'group1');
addToScrollGroup(document.getElementById('right'), 'group1');
```

## 📜 API
### 🔗 **addToScrollGroup(el: HTMLElement, groupId: string)**
- **el**: The DOM element to be synchronized.
- **groupId**: Identifier for the scroll group.

### 🔗 **removeFromScrollGroup(el: HTMLElement, groupId: string)**
- **el**: The DOM element to be unsynchronized.
- **groupId**: Identifier for the scroll group.

---

### 🖥️ Hack the code, sync the scroll! 🖥️
