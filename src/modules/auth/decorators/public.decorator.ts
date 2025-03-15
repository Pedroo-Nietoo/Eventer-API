import { SetMetadata } from '@nestjs/common';

/**
 * A constant key used to mark routes as public.
 * @constant
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * A decorator that marks a route handler as public.
 *
 * This decorator uses `SetMetadata` to attach a metadata key indicating that the route handler
 * does not require authentication. Guards or other mechanisms can use this metadata to allow
 * public access to the route.
 *
 * @returns {CustomDecorator<string>} - A custom decorator that sets the public metadata.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
