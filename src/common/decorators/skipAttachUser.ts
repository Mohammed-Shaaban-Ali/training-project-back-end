import {SetMetadata} from '@nestjs/common';;



export const SKIP_ATTACH_LOGGED_USER = 'skipAttachUser';
export const SkipAttachLoggedUser = () => SetMetadata(SKIP_ATTACH_LOGGED_USER, true);