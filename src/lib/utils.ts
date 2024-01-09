export const getFeatureFlag = (flagName: string): boolean => {
  const envVarName = `VITE_FEATURE_${flagName.toUpperCase()}`
  return import.meta.env[envVarName] === 'true'
}
