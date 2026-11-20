import { defineConfig } from 'playwright/test';
export default defineConfig({
 testDir:'./tests/visual', fullyParallel:false, workers:1,
 snapshotPathTemplate:'{testDir}/baselines/{projectName}/{arg}{ext}',
 use:{deviceScaleFactor:2,hasTouch:true,locale:'ru-RU',colorScheme:'dark'},
 projects:['chromium','webkit'].map(browserName=>({name:browserName,use:{browserName}})),
 expect:{toHaveScreenshot:{maxDiffPixelRatio:0.001,animations:'disabled'}},
 reporter:'list'
});
