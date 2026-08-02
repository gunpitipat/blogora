import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const AuthTextField = styled(TextField)(({ theme }) => ({
  '--auth-input-padding-y': '12px',

  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
      {
        borderColor: theme.palette.primary.main,
      },
    '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    fontSize: 16,
    letterSpacing: '0.05em',
    paddingBlock: 'var(--auth-input-padding-y)',
  },
  '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
    fontSize: 16,
    transform: 'translate(14px, var(--auth-input-padding-y)) scale(1)',
  },
  '& .MuiInputLabel-root.Mui-focused:not(.Mui-error)': {
    color: theme.palette.primary.main,
  },
  '& .MuiFormHelperText-root': {
    marginInline: 0,
  },
}));

export default AuthTextField;
