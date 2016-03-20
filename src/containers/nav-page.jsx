import * as React from 'react';
import {connect} from 'react-redux';

import EntityView from '../components/entity-view';
import LoadingIndicator from '../components/loading-indicator';
import {navEntityAction, dlRequestAction} from '../actions';
import {getLoadedEntity} from '../dl-state';
import {UNKNOWN, LOADING, OK} from '../nav-state';


export default class NavPage extends React.Component {
    componentWillMount() {
        this.checkEntity(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.checkEntity(nextProps);
    }

    checkEntity(props) {
        const {entity, loadingStatus} = props;

        if (!entity) {
            // Need some kind of index page. For now jump to a known state.
            this.props.navEntityAction('person', 'person2.json');
        } else if (loadingStatus === UNKNOWN) {
            this.props.dlRequestAction(entity.cls, entity.href);
        }
    }

    render() {
        const {entity, loadingStatus} = this.props;

        if (entity && loadingStatus === OK) {
            return <EntityView entity={entity} onEntityActivate={e => this.props.navEntityAction(e.cls, e.href)}/>;
        }
        return <LoadingIndicator/>;
    }
}


function propsFromState(state, ownProps) {
    const {loadingStatus} = state.nav;
    let {entity} = state.nav;
    if (loadingStatus === OK) {
        entity = getLoadedEntity(state.dl, entity.href, 2);
    }
    return {
        entity,
        loadingStatus,
    }
}

function propsFromDispatch(dispatch) {
    return {
        navEntityAction: (cls, entityUrl) => dispatch(navEntityAction(cls, entityUrl)),
        dlRequestAction: (cls, entityUrl) => dispatch(dlRequestAction(cls, entityUrl)),
    };
}

export default connect(propsFromState, propsFromDispatch)(NavPage);
