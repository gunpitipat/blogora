import { useState, type ComponentProps } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AuthTextField from '@/features/auth/components/AuthTextField';

type AuthPasswordFieldProps = Omit<
  ComponentProps<typeof AuthTextField>,
  'slotProps' | 'type'
>;

const AuthPasswordField = (props: AuthPasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <AuthTextField
      {...props}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end" sx={{ mr: 0.5 }}>
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                disabled={props.disabled}
                edge="end"
                onClick={() => setVisible((current) => !current)}
                // Prevent a mouse click from stealing focus from the password input
                onMouseDown={(event) => event.preventDefault()}
                sx={{ color: 'primary.main' }}
              >
                {visible ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      type={visible ? 'text' : 'password'}
    />
  );
};

export default AuthPasswordField;
