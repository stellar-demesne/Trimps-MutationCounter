
function WMSD_current_zone_raging() {
    let zone = game.global.world;
    let useful_zone = zone - 201
    let count = 5 + Math.floor(useful_zone / 5);
    return Math.min(count, 60);
}

function WMSD_current_zone_novad() {
    let zone = game.global.world;
    let useful_zone = zone - 201;
    let num_stars = Math.min(3, 1 + Math.floor(useful_zone / 75));
    let star_armlength = Math.min(3, 1 + Math.floor(useful_zone / 100));
    let star_cellcount = 1 + (4 * star_armlength);
    return num_stars * star_cellcount;
}

function WMSD_current_zone_compressed() {
    let zone = game.global.world;
    let useful_zone = zone - 201;
    let num_compressions = Math.min(6, 1 + Math.floor(useful_zone / 40));
    let compression_cellcount = Math.min(7, 3 + Math.floor(useful_zone / 100));
    return num_compressions * compression_cellcount;
}

function WMSD_current_zone_randomised() {
    let zone = game.global.world;
    let useful_zone = zone - 201;
    let swaps = Math.min(4, 1 + Math.floor(useful_zone / 50));
    return 20 * swaps
}

function WMSD_total_mut_types_predicted() {
    return Math.min(4, Math.floor((game.global.world - 201) / 50) + 1)
}

function WMSD_extra_multipliers() {
    let multiplier = 1;
    if (game.global.desoCompletions > 0) {
        multiplier *= game.challenges.Desolation.getTrimpMult();
    }
    if (game.global.challengeActive == "Daily") {
        multiplier *= (1 + (getDailyHeliumValue(countDailyWeight()) / 100));
    }
    if (Fluffy.isRewardActive("bigSeeds")) {
        multiplier *= 10;
    }
    if (game.heirlooms.Staff.SeedDrop.currentBonus > 0) {
      multiplier *= (1 + (scaleHeirloomModUniverse("Staff", "SeedDrop", game.heirlooms.Staff.SeedDrop.currentBonus) / 100));
    }
    if (u2SpireBonuses.seedDrop() > 1) {
        multiplier *= u2SpireBonuses.seedDrop();
    }
    return multiplier;
}

function WMSD_seeds_base_per_cell() {
    return game.global.world - 199;
}

function WMSD_seeds_from(mut_base_types) { // argument is an array
    let seeds_base = WMSD_seeds_base_per_cell();
    let multiplier = 0;
    for (let indice = 0; indice < mut_base_types.length; indice++) {
        if (mut_base_types[indice] === "RGE") {
            multiplier += 1 // raging() / raging(), theoretically
        }
        if (mut_base_types[indice] === "NVA" || mut_base_types[indice] === "NVX") {
            multiplier += WMSD_current_zone_raging() / WMSD_current_zone_novad()
        }
        if (mut_base_types[indice] === "CMP" || mut_base_types[indice] === "CMX") {
            multiplier += WMSD_current_zone_raging() / WMSD_current_zone_compressed()
        }
        if (mut_base_types[indice] === "CSP" || mut_base_types[indice] === "CSX") {
            multiplier += WMSD_current_zone_raging() / WMSD_current_zone_randomised()
        }
    }
    multiplier *= mut_base_types.length;
    multiplier *= WMSD_extra_multipliers();
    return multiplier * seeds_base;
}

function WMSD_total_seeds() {
    let seedtotal = 0;
    let remaining_seeds = 0;
    let mutation_counts = [0, 0, 0, 0, 0, 0];
    if (game.global.world > 200) {
        for (let indice = 0; indice < 100; indice++) {
            let cell_mutations = game.global.gridArray[indice].u2Mutation;
            if (cell_mutations.length > mutation_counts.length) {
                mutation_counts[mutation_counts.length-1] += 1;
            }
            else {
                mutation_counts[cell_mutations.length] += 1;
            }
            if (cell_mutations.length > 0) {
                seedtotal += WMSD_seeds_from(cell_mutations);
                if (indice > game.global.lastClearedCell) {
                    remaining_seeds += WMSD_seeds_from(cell_mutations);
                }
            }
        }
    }
    return [seedtotal, remaining_seeds, mutation_counts];
}

function WMSD_tooltip_text() {
    let seeds_per_mutation = WMSD_seeds_base_per_cell() * WMSD_current_zone_raging() * WMSD_extra_multipliers();
    let informations = WMSD_total_seeds();
    let resulttext = '';
    resulttext += '<p>'+ prettify(informations[1]) + ' seeds remain to be obtained from this zone.</p>'
    resulttext += '<p>This zone holds ' + prettify(informations[0]) + ' seeds in total.'
    if (WMSD_total_mut_types_predicted() > 1) {
        resulttext += ' Each mutation is contributing ' + prettify(seeds_per_mutation) + ' to the total.'
    }
    resulttext += '</p>'
    if (informations[2][0] + informations[2][1] != 100) {
        resulttext += '<p>Super Mutations are boosting seed count! This zone has '
        if (informations[2][2] > 0) {
            resulttext += prettify(informations[2][2]) + ' double-mutated'
        }
        if (informations[2][3] > 0) {
            if (informations[2][2] > 0) {
                if (informations[2][4] == 0) {
                    resulttext += ' and '
                }
                else {
                    resulttext += ', '
                }
            }
            resulttext += prettify(informations[2][3]) + ' triple-mutated'
        }
        if (informations[2][4] > 0) {
            if (informations[2][2] + informations[2][3] > 0) {
                resulttext += ' and '
            }
            resulttext += prettify(informations[2][4]) + ' quadruple-mutated'
        }
        if (informations[2][5] > 0) {
            if (informations[2][2] + informations[2][3] + informations[2][4] > 0) {
                resulttext += ', and incredibly, '
            }
            resulttext += prettify(informations[2][4]) + ' quintuple-mutated (or more)'
        }
        resulttext += ' cells. A multi-mutated cell gives the sum of the per-cell seed drops expected from its mutations, multiplied by how many mutations are present.</p>'

        let mutation_type_count = WMSD_total_mut_types_predicted();
        let no_overlaps_seeds_result = mutation_type_count * seeds_per_mutation;
        let supermut_boost = (( informations[0] / no_overlaps_seeds_result ) * 100) - 100
        resulttext += '<p>You are getting ' + prettify(supermut_boost) + '% more seeds than the minimum possible because of super mutations!'
        if (game.global.world > 300) {
            resulttext += ' (The theoretic minimum of seeds-per-zone is getting extremely unlikely.)'
        }
        resulttext += '</p>'
    }
    return resulttext;
}

function WMSD_make_tooltip() {
    return "tooltip('Mutated Seeds Drop Summary', 'customText', event, '" + WMSD_tooltip_text() + "')";
}

function WMSD_infobox_text() {
    let informations = WMSD_total_seeds();
    let resulttext = prettify(informations[1]) + '<br\>(of ' + prettify(informations[0]) + ')';
    return resulttext;
}

function WMSD_update_all_texts() {
    if (usingRealTimeOffline == true) {
        return '';
    }
    const target_element = document.getElementById('MutatedSeedDropInfo');

    if (game.global.world < 201 || game.global.universe === 1) {
        target_element.innerHTML = '';
    }
    else {
        target_element.innerHTML = WMSD_infobox_text();
        target_element.parentNode.setAttribute('onmouseover', WMSD_make_tooltip());
    }
}

function WMSD_make_box_for_mutated_seed_info() {
    const containerMutSeedInfo = document.createElement('DIV');

    let standard_colours = ' color: rgb(0,0,0); background-color: rgb(255,255,255);';
    let darkmode_colours = ' color: rgb(0,0,0); background-color: rgb(93,93,93);';

    let chosen_colours = (game.options.menu.darkTheme.enabled == 2) ? darkmode_colours : standard_colours
    containerMutSeedInfo.setAttribute('style', 'display: block; position: absolute; top: 0; width: 28%; font-size: 0.7em; text-align: center;' + chosen_colours);
    containerMutSeedInfo.setAttribute('class', 'noselect');;
    // containerMutSeedInfo.setAttribute('onmouseover', WMSD_make_tooltip()); // oop it verry borke, before. my bad.
    containerMutSeedInfo.setAttribute('onmouseout', 'tooltip("hide")');

    const textareaMutSeedInfo = document.createElement('SPAN');
    textareaMutSeedInfo.id = 'MutatedSeedDropInfo';
    containerMutSeedInfo.appendChild(textareaMutSeedInfo)

    let target_area = document.getElementById('metal');
    target_area.insertBefore(containerMutSeedInfo, target_area.children[0]);
}

function WMSD_initialise() {
    if (document.getElementById('MutatedSeedDropInfo') === null) {
        WMSD_make_box_for_mutated_seed_info();
    }
    WMSD_update_all_texts();
    setInterval( function () {
        WMSD_update_all_texts();
    }, 1000);
}
WMSD_initialise();
