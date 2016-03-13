import * as React from 'react';

export default function EntityView({entity}) {
    return (
        <div className="stouses-EntityView">
            <h1>{entity.name ? `${entity.name} (${entity.cls})` : `A ${entity.cls}`}</h1>
        </div>
    );
}
