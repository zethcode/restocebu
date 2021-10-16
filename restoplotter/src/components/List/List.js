import { Grid, Typography } from '@material-ui/core'
import React from 'react'

const List = () => {
    return (
        <div>
            <h1>List</h1>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5">
                        Filters
                    </Typography>
                </Grid>
            </Grid>
        </div>
    )
}

export default List
