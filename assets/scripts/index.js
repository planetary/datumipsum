const Noise = require('noisejs').Noise;
const d3 = require('d3');

const state = {
    points: 50,
    items: [],
    data: []
};

const graph = document.getElementById('graph');

const settingsTemplate = {
    noise: {
        seed: {
            type: 'number',
            min: 0,
            max: 1000
        },
        wavelength: {
            type: 'slider',
            min: 2,
            max: 10,
            step: 1
        },
        amplitude: {
            type: 'slider',
            min: 0,
            max: 5,
            step: 0.1
        }
    },
    sine: {
        frequency: {
            type: 'slider',
            min: 1,
            max: 10,
            step: 1
        },
        amplitude: {
            type: 'slider',
            min: 0,
            max: 10
        },
        offset: {
            type: 'slider',
            min: -(state.points / 2),
            max: (state.points / 2),
            step: 1
        }
    },
    exponential: {
        slope: {
            type: 'slider',
            min: 2,
            max: 100,
            step: 2
        },
        amplitude: {
            type: 'slider',
            min: 0,
            max: 10
        }
    }
};

const renderGraph = () => {
    const margin = 20;
    const width = graph.offsetWidth;
    const height = graph.offsetHeight - (margin * 2);

    const x = d3.scale.linear().range([0, width]);
    const y = d3.scale.linear().range([height, 0]);

    x.domain(d3.extent(state.data, (d) => d[0]));
    y.domain(d3.extent(state.data, (d) => d[1]));

    const line = d3.svg.line()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]));

    const graphExists = document.querySelectorAll('svg').length;

    if(graphExists) {
        const svg = d3.select(graph);

        svg.select('.line')
            .datum(state.data)
            .attr('d', line);
    } else {
        const svg = d3.select(graph).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(0, ${margin} )`);

        svg.append('path')
            .datum(state.data)
            .attr('class', 'line')
            .attr('d', line);
    }
};


const updateData = () => {
    state.data = ['data'];
    for (let i = 0; i < state.points; i++) {
        let value = 0;
        for (let j = 0; j < state.items.length; j++) {
            const thisItem = state.items[j];
            switch (thisItem.type) {
                case 'sine':
                    value += (
                        (1 + (Math.sin(Math.PI * 2 * (((i / state.points) +
                        (thisItem.offset / state.points)) * thisItem.frequency) + Math.PI))) *
                        ((thisItem.amplitude) / 2)
                    );
                    break;
                case 'noise':
                    const thisNoise = new Noise(thisItem.seed);
                    value += thisNoise.perlin2(i / thisItem.wavelength, i / thisItem.wavelength) *
                    thisItem.amplitude;
                    break;
                case 'exponential':
                    value += ((Math.pow((thisItem.slope), (i / state.points))) / thisItem.slope) *
                    thisItem.amplitude;
                    break;
                default:
            }
        }
        state.data[i] = [i, value.toPrecision(3)];
    }
    renderGraph();
    $('.modal--data').text(state.data.slice(1, -1));
};


const downloadChart = () => {
    const e = document.createElement('script');
    e.setAttribute('src', 'https://nytimes.github.io/svg-crowbar/svg-crowbar.js');
    e.setAttribute('class', 'svg-crowbar');
    document.body.appendChild(e);
};

const updateSettings = (item) => {
    if ($(item).attr('class') === 'globals--points') {
        state.points = $(item).val();
    } else {
        const thisIndex = $(item).parents('.config--item').index('.config--item');
        let thisType = '';
        let thisVal = 0;
        $(item).each(function() {
            thisType = $(this).attr('name');
            thisVal = $(this).val();
        });
        state.items[thisIndex][thisType] = thisVal;
    }
    updateData();
};

const bindItemHandlers = () => {

    // first, unbind
    $('.config--item-delete').off();
    $('.config--item-settings-toggle').off();
    $('input').off();
    $('.download').off();

    // now, bind
    $('.config--item-delete').on('click', function() {
        const thisIndex = $(this).parents('.config--item').index('.config--item');
        removeItem(thisIndex);
    });
    $('.config--item-settings-toggle').on('click', function() {
        $(this).parents('.config--item').children('.config--item-settings')
            .toggleClass('is-shown');
    });
    $('input').on('change', function() {
        updateSettings(this);
    });
    $('.download').on('click', downloadChart);
};

const updateConfig = () => {
    // update octaves
    const items = [];
    if (state.items.length === 0) {
        $('.config--col-content').html('<div class="config--empty">No Octaves — try adding one!' +
            '</div>');
    } else {
        for (let i = 0; i < state.items.length; i++) {
            const thisItem = state.items[i];
            let settings = '';
            for (const setting in settingsTemplate[thisItem.type]) {
                const thisSetting = settingsTemplate[thisItem.type][setting];
                settings += `<label class="setting"><div class="setting--label">${setting}</div>`;
                switch (thisSetting.type) {
                    case 'number':
                        settings += `<input class="setting--input" type="number" name="${setting}"
                            min="${thisSetting.min}" max="${thisSetting.max}"
                            value="${thisItem[setting]}"/>`;
                        break;
                    case 'slider':
                        settings += `<input class="setting--input" type="range" name="${setting}"
                            min="${thisSetting.min}" max="${thisSetting.max}"
                            value="${thisItem[setting]}" step="${thisSetting.step}"/>`;
                        break;
                }
                settings += `</label>`;
            }
            items.push(`
                <div class="config--item config--item-${thisItem.type}">
                    <div class="config--item-header">
                        <div class="config--item-type">${thisItem.type}</div>
                        <div class="button button--action config--item-settings-toggle">Edit</div>
                        <div class="button button--warning config--item-delete">Delete</div>
                    </div>
                    <div class="config--item-settings">
                     ${settings}
                    </div>
                </div>
            `);
        }
        $('.config--col-content').html(items.join(''));
    }
    bindItemHandlers();
};

const removeItem = (index) => {
    state.items.splice(index, 1);
    updateConfig();
    updateData();
};

const addItem = (type) => {
    let newItem = {};
    switch(type) {
        case 'sine':
            newItem = {
                type: 'sine',
                frequency: 1,
                amplitude: 5,
                offset: 0
            };
            break;
        case 'noise':
            newItem = {
                type: 'noise',
                seed: 100,
                wavelength: 2,
                amplitude: 2.5
            };
            break;
        case 'exponential':
            newItem = {
                type: 'exponential',
                slope: 2,
                amplitude: 5
            };
            break;
        default:

            // do something
    }
    state.items.push(newItem);
    updateConfig();
    updateData();
};

const toggleModal = () => {
    $('.modal').toggleClass('is-open');
};

const init = () => {
    $('.config--col-add').on('click', function() {
        addItem($(this).attr('data-add'));
    });
    $('.globals--points').val(state.points);
    $('.modal--toggle').on('click', toggleModal);
    $('.modal--scrim').on('click', function(e) {
        if($('.modal').hasClass('is-open'))
            toggleModal();
        e.stopPropagation();
    });
    renderGraph();
    updateConfig();
};

$(document).ready(function() {
    init();
});
