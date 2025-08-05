# scroll-sync-group

A tiny utility to sync scroll positions of multiple elements.

## Installation

```bash
npm install scroll-sync-group
```

## Usage

```ts
import { addToScrollGroup } from 'scroll-sync-group';

addToScrollGroup(document.getElementById('left'), 'group1');
addToScrollGroup(document.getElementById('right'), 'group1');
```

## API

**addToScrollGroup(el: HTMLElement, groupId: string)**

**removeFromScrollGroup(el: HTMLElement, groupId: string)**
