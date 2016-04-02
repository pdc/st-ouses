import * as React from 'react';

import {pacomoTransformer} from '../util/pacomo';
import LabelledValue from './labelled-value';
import LabelledValues from './labelled-values';

import './entity-view.less';


const valueFormats = {};

const skippedAttrs = new Set([
    'cls',
    'name',
    'href',
]);

function EntityView({entity, onEntityActivate}) {
    const propss = [];
    for (const k in entity) {
        if (entity.hasOwnProperty(k)) {
            if (!skippedAttrs.has(k)) {
                propss.push(Object.assign({name: k, label: k}, valueFormats[k], {value: entity[k]}));
            }
        }
    }
    return (
        <div>
            <h1 className='heading'>{entity.name ? `${entity.name} (${entity.cls})` : `A ${entity.cls}`}</h1>

            <LabelledValues>
                {propss.map(({name, label, value}) => <LabelledValue key={name} label={label} value={value} onEntityActivate={onEntityActivate}/>)}
            </LabelledValues>
        </div>
    );
}
EntityView.displayName = 'EntityView';

export default pacomoTransformer(EntityView);
