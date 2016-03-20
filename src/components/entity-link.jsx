import * as React from 'react';

import {pacomoTransformer} from '../util/pacomo';
import './entity-link.less';


function EntityLink({entity, onActivate}) {
    const onClick = onActivate && (ev => {ev.preventDefault(); onActivate();});
    if ('name' in entity) {
        return (
            <a href="#" onClick={onClick}>
                <b>{entity.name}</b> <small>({entity.cls})</small>
            </a>
        );
    } else {
        return (
            <a href="#" onClick={onClick}>
                <b>A {entity.cls}</b>
            </a>
        );
    }
}
EntityLink.displayName = 'EntityLink';

export default pacomoTransformer(EntityLink);
