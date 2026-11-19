import type { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard';
import { Section } from './components/section';

import { sections } from './models/sections';

export const routes: Routes = [
  { path: '', component: Dashboard, pathMatch: 'full', title: 'Panel operativo | STorder' },
  ...sections.map(({ path, title, description }) => ({
    path,
    component: Section,
    title: `${title} | STorder`,
    data: { heading: title, description },
  })),
  { path: '**', redirectTo: '' },
];
