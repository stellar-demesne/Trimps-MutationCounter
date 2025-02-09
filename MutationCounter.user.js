// ==UserScript==
// @name         MutationCounter
// @namespace    https://github.com/stellar-demesne/Trimps-MutationCounter
// @version      1.0
// @updateURL    https://github.com/stellar-demesne/Trimps-MutationCounter/MutationCounter.user.js
// @description  Mutated Seed Counter for Trimps
// @author       StellarDemesne
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'MutationCounter';
script.src = 'https://stellar-demesne.github.io/Trimps-MutationCounter/MutationCounter.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
