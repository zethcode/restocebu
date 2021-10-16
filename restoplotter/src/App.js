import './App.css';
import { CssBaseline, Grid } from '@material-ui/core';
import Header from './components/Header/Header';
import List from './components/List/List';
import WrappedMap from './components/Map/Map';

const App = () => {
  return (
    <>
      <CssBaseline />
      {/* <Header /> */}
      <Grid container spacing={3} style={{ width: '100%' }}>
        <Grid item xs={12} md={2}>
          <List />
        </Grid>
        <Grid item xs={12} md={10}>
          <WrappedMap />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
