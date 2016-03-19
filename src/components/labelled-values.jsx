import * as React from 'react';

import {pacomoTransformer} from '../util/pacomo';
import './labelled-values.less';

/**
 * Holder for LabelledValue components.
 */
export default pacomoTransformer(
    function LabelledValues({children}) {
        return <table><tbody>{children}</tbody></table>;
    }
);
