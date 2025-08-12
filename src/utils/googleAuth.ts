// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '892033335017-gjlqssdvv999hut26f7fmfpn1ct5ss3h.apps.googleusercontent.com';

declare global {
  interface Window {
    google: any;
  }
}

export const initializeGoogleAuth = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google) {
      resolve();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        reject(new Error('Google Sign-In SDK failed to load'));
      }, 10000);
    }
  });
};

export const signInWithGoogle = async (): Promise<string> => {
  try {
    await initializeGoogleAuth();
    console.log('Google SDK loaded successfully');
    
    return new Promise((resolve, reject) => {
      try {
        // Initialize Google Sign-In with button-only approach
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            console.log('Google OAuth response:', response);
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
          auto_select: false,
        });

        // Don't use prompt - let the button handle the sign-in
        console.log('Google OAuth initialized for button-based sign-in');
        reject(new Error('Use the Google button for sign-in'));
      } catch (error) {
        console.error('Google OAuth initialization error:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Google OAuth setup error:', error);
    throw error;
  }
};

export const renderGoogleSignInButton = (elementId: string) => {
  if (!window.google) {
    console.error('Google SDK not loaded');
    return;
  }
  
  try {
    // Clean up any existing buttons
    const existingButton = document.querySelector(`#${elementId} > div`);
    if (existingButton) {
      existingButton.remove();
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
      }
    );
  } catch (error) {
    console.error('Error rendering Google button:', error);
  }
};

export const testGoogleConfiguration = async () => {
  try {
    await initializeGoogleAuth();
    console.log('✅ Google SDK loaded successfully');
    console.log('✅ Client ID:', GOOGLE_CLIENT_ID);
    console.log('✅ Current origin:', window.location.origin);
    
    // Clean up any existing global containers
    const existingContainer = document.getElementById('google-signin-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Google configuration test failed:', error);
    return false;
  }
};

export const cleanupGoogleContainers = () => {
  const containers = document.querySelectorAll('[id*="google-signin"]');
  containers.forEach(container => {
    if (container.id !== 'google-signin-button') {
      container.remove();
    }
  });
}; 

export const testSimpleGoogleAuth = async () => {
  try {
    await initializeGoogleAuth();
    console.log('✅ Testing simple Google auth...');
    
    // Test with minimal configuration
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        console.log('✅ Simple Google auth test successful:', response);
      },
    });
    
    console.log('✅ Simple Google auth test passed');
    return true;
  } catch (error) {
    console.error('❌ Simple Google auth test failed:', error);
    return false;
  }
}; 