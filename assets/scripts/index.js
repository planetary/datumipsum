const Noise = require('noisejs').Noise;
const c3 = require('c3');

const state = {
    points: 50,
    items: [],
    data: ['data']
};

let chart;

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

const bindItemHandlers = () => {
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
    chart = c3.generate({
        bindto: '.graph',
        interaction: {
            enabled: false
        },
        data: {
            columns: [
                state.data
            ],
            type: 'spline'
        },
        point: {
            show: false
        },
        axis: {
            x: {
                min: 0,
                max: state.points - 1,
                show: false
            },
            y: {
                show: false
            }
        },
        legend: {
            show: false
        }
    });
    updateConfig();
};

$(document).ready(function() {
    init();
});

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
        state.data[i + 1] = value.toPrecision(3);
    }
    chart.load({
        columns: [
            state.data
        ]
    });
    chart.axis.max({
        x: state.points - 1
    });
    $('.modal--data').text(state.data.slice(1, -1));
};
