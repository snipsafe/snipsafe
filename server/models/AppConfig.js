const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
  authMode: {
    type: String,
    enum: ['local', 'azure_ad'],
    default: 'local'
  },
  azureAd: {
    clientId: String,
    clientSecret: String,
    tenantId: String,
    enabled: {
      type: Boolean,
      default: false
    }
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  defaultOrganization: {
    type: String,
    default: 'Default'
  }
}, {
  timestamps: true
});

// Singleton pattern - only one config document
appConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne({});
  
  // If config exists but might be corrupted, clean it up
  if (config) {
    try {
      // Check if azureAd.enabled is corrupted (contains string instead of boolean)
      if (typeof config.azureAd.enabled === 'string') {
        console.log('🔧 Detected corrupted configuration, cleaning up...');
        // Delete the corrupted document
        await config.deleteOne();
        config = null;
      }
    } catch (error) {
      console.log('🔧 Configuration validation failed, recreating...');
      if (config) {
        await config.deleteOne();
      }
      config = null;
    }
  }
  
  if (!config) {
    // Validate Azure AD configuration if AUTH_MODE is azure_ad
    if (process.env.AUTH_MODE === 'azure_ad') {
      if (!process.env.AZURE_AD_CLIENT_ID) {
        throw new Error('❌ AZURE_AD_CLIENT_ID is required when AUTH_MODE is azure_ad');
      }
      if (!process.env.AZURE_AD_CLIENT_SECRET) {
        throw new Error('❌ AZURE_AD_CLIENT_SECRET is required when AUTH_MODE is azure_ad');
      }
      if (!process.env.AZURE_AD_TENANT_ID) {
        throw new Error('❌ AZURE_AD_TENANT_ID is required when AUTH_MODE is azure_ad');
      }
      console.log('✅ Azure AD configuration validated');
    }

    // Initialize from environment variables if available
    const azureAdEnabled = process.env.AUTH_MODE === 'azure_ad' && 
                          process.env.AZURE_AD_CLIENT_ID && 
                          process.env.AZURE_AD_CLIENT_SECRET && 
                          process.env.AZURE_AD_TENANT_ID;

    config = new this({
      authMode: process.env.AUTH_MODE || 'local',
      defaultOrganization: process.env.DEFAULT_ORGANIZATION || 'Default',
      allowRegistration: process.env.AUTH_MODE !== 'azure_ad',
      azureAd: {
        clientId: process.env.AZURE_AD_CLIENT_ID || '',
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
        tenantId: process.env.AZURE_AD_TENANT_ID || '',
        enabled: Boolean(azureAdEnabled) // Ensure it's a boolean
      }
    });
    
    try {
      await config.save();
      console.log('📝 Configuration initialized from environment variables');
    } catch (saveError) {
      console.error('❌ Failed to save configuration:', saveError.message);
      throw saveError;
    }
  } else {
    // Update existing config with env vars if they exist
    let updated = false;
    
    if (process.env.AUTH_MODE && config.authMode !== process.env.AUTH_MODE) {
      // Validate Azure AD configuration if switching to azure_ad mode
      if (process.env.AUTH_MODE === 'azure_ad') {
        if (!process.env.AZURE_AD_CLIENT_ID || !process.env.AZURE_AD_CLIENT_SECRET || !process.env.AZURE_AD_TENANT_ID) {
          throw new Error('❌ Incomplete Azure AD configuration. Required: AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID');
        }
      }
      
      config.authMode = process.env.AUTH_MODE;
      updated = true;
    }
    
    if (process.env.DEFAULT_ORGANIZATION && config.defaultOrganization !== process.env.DEFAULT_ORGANIZATION) {
      config.defaultOrganization = process.env.DEFAULT_ORGANIZATION;
      updated = true;
    }
    
    // Update Azure AD settings
    if (process.env.AZURE_AD_CLIENT_ID && config.azureAd.clientId !== process.env.AZURE_AD_CLIENT_ID) {
      config.azureAd.clientId = process.env.AZURE_AD_CLIENT_ID;
      updated = true;
    }
    
    if (process.env.AZURE_AD_CLIENT_SECRET && config.azureAd.clientSecret !== process.env.AZURE_AD_CLIENT_SECRET) {
      config.azureAd.clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
      updated = true;
    }
    
    if (process.env.AZURE_AD_TENANT_ID && config.azureAd.tenantId !== process.env.AZURE_AD_TENANT_ID) {
      config.azureAd.tenantId = process.env.AZURE_AD_TENANT_ID;
      updated = true;
    }
    
    // Enable Azure AD if all required env vars are present and auth mode is azure_ad
    const shouldEnableAzureAd = process.env.AUTH_MODE === 'azure_ad' && 
                                process.env.AZURE_AD_CLIENT_ID && 
                                process.env.AZURE_AD_CLIENT_SECRET && 
                                process.env.AZURE_AD_TENANT_ID;
    
    if (config.azureAd.enabled !== shouldEnableAzureAd) {
      config.azureAd.enabled = Boolean(shouldEnableAzureAd); // Ensure it's a boolean
      updated = true;
    }
    
    // Disable registration for Azure AD mode
    const shouldAllowRegistration = process.env.AUTH_MODE !== 'azure_ad';
    if (config.allowRegistration !== shouldAllowRegistration) {
      config.allowRegistration = shouldAllowRegistration;
      updated = true;
    }
    
    if (updated) {
      try {
        await config.save();
        console.log('📝 Configuration updated from environment variables');
      } catch (saveError) {
        console.error('❌ Failed to update configuration:', saveError.message);
        throw saveError;
      }
    }
  }
  return config;
};

module.exports = mongoose.model('AppConfig', appConfigSchema);
