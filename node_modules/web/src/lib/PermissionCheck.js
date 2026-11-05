/**
 * Utility for checking user permissions based on their assigned role
 */

export const hasPermission = (user, permissionName) => {
  if (!user || !user.expand?.role_id?.permissions) return false;
  
  // Super admins implicitly have all permissions
  if (user.role === 'super_admin') return true;
  
  return user.expand.role_id.permissions.includes(permissionName);
};

export const hasAnyPermission = (user, permissionArray) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return permissionArray.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user, permissionArray) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return permissionArray.every(permission => hasPermission(user, permission));
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};