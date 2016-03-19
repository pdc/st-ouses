import * as React from 'react';

import {pacomoTransformer} from '../util/pacomo';
import EntityLink from './entity-link';

import './labelled-value.less';


function fmt(value) {
    console.log('fmt', value);
    if (typeof value === 'object') {
        if ('items' in value) {
            return <ul>{value.items.map((x, i) => <li key={i}><EntityLink entity={x}/></li>)}</ul>;
        } else if ('id' in value) {
            return <EntityLink entity={value}/>;
        }
    } else {
        return <span>{value}</span>;
    }
}

export default pacomoTransformer(
    function LabelledValue({label, value}) {
        return (
            <tr>
                <th className='label'>{label}</th>
                <td className='value'>{fmt(value)}</td>
            </tr>
        );
    }
);
