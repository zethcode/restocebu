import './App.css';
import { CssBaseline, Grid } from '@material-ui/core';
import Map from './components/Map/Map';

const App = () => {
  return (
    <>
      <CssBaseline />
      <Grid container style={{ width: '100%' }}>
        <Grid item xs={12} md={12}>
          <Map />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
