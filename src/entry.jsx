import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Hello} from './content';


require("./style.css");

ReactDom.render(<Hello/>, document.getElementById('main'));
