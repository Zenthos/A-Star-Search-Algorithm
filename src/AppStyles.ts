import { createUseStyles } from 'react-jss';

// Dark Theme
const border_text = '#EDEDED';
const background = '#444444';
const canvas_bg = '#171717';
const button_default = '#DA0037';
const button_hover = '#BA0037';

// Light Theme
// const border_text = 'black';
// const background = 'white';
// const canvas_bg = 'white';
// const button_default = 'black';
// const button_hover = 'gray';

export const AppStyles = createUseStyles({
  root: {
    width: '100vw',
    height: '100vh',
    background: `${background}`
  },
  container: {
    display: 'flex',
    height: '98%',
  },
  canvas: {
    border: `1px solid ${border_text}`,
    background: canvas_bg
  },
  left: {
    padding: '0.5rem'
  },
  right: {
    padding: '0.5rem'
  },
  button: {
    display: 'block',
    margin: '8px 0px',
    padding: '0.5rem',
    color: 'white',
    backgroundColor: button_default,
    borderRadius: 8,
    borderWidth: 0,
    width: '250px',
    '&:hover': {
      backgroundColor: button_hover,
    },
  },
  svgButton: {
    margin: 0,
    padding: 0,
    border: 0,
    background: 'transparent',
    height: '24px',
    cursor: 'pointer',
    '&:active': {
      transform: 'rotate(90deg)',
      '-webkit-transform': 'rotate(90deg)',
      '-ms-transform': 'rotate(90deg)',
    }
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  graphActions: {
    border: `1px solid ${border_text}`,
    padding: '1rem',
    height: '50%',
  },
  pageActions: {
    border: `1px solid ${border_text}`,
    marginBottom: '1rem',
    padding: '1rem',
    height: '50%'
  },
  headerContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    minWidth: '250px',
  },
  headers: {
    fontSize: 20,
    fontWeight: 600,
    display: 'block',
    color: border_text,
    textDecoration: 'underline',
    margin: '0px 0px 16px 0px',
  },
  text: {
    color: border_text,
  }
});