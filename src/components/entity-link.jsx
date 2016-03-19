import * as React from 'react';

import {pacomoTransformer} from '../util/pacomo';
import './entity-link.less';


function EntityLink({entity}) {
    if ('name' in entity) {
        return <a href="#"><b>{entity.name}</b> <small>({entity.cls})</small></a>;
    }
    return <a href="#"><b>A {entity.cls}</b></a>;
}
EntityLink.displayName = 'EntityLink';

export default pacomoTransformer(EntityLink);
