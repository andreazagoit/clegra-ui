import * as avatar from "@clegra/ui/components/avatar"
import * as avatarDrawn from "@clegra/ui/drawn/components/avatar"

import { defineCase } from "../case"

export default defineCase("avatar", [avatar], [avatarDrawn], ({ Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, Div }) => (
  <Div className="flex flex-row items-center gap-4">
    <Avatar size="sm">
      <AvatarFallback>AZ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarFallback>LB</AvatarFallback>
    </Avatar>
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  </Div>
))
