import React, { useEffect, useState, Fragment } from 'react';
import useStore from '../Store';
import axios from 'axios';

function Moves() {
    const { mode } = useStore();

    return (
        <Fragment>
            Moves
        </Fragment>
    );
}

export default Moves;
