import { Tag } from "@prisma/client"
import { X } from "lucide-react"
import { useState } from "react"
import Badge from "~/components/primitives/badge/badge"
import { cn } from "~/lib/utils"



interface BadgeTagProps {
    tag: Tag
    tagColor?: boolean
    actionName?: string
    classNameContainer?: string
    classNameLabel?: string
}

export default function BadgeTag({ tag, tagColor = true, actionName, classNameContainer, classNameLabel }: BadgeTagProps) {
    const [isHovered, setIsHovered] = useState(false)


    let props = {}

    if (tagColor) {
        props = {
            ...props,
            style: {
                backgroundColor: tag.colorHEX
            }
        }
    }



    return (
        <Badge className={cn("cursor-pointer", classNameContainer)} {...props}>
            <div className="flex gap-3"
                onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <span className={
                    cn(
                        tag.colorHEX || "text-white",
                        classNameLabel
                    )
                }>{tag.name}</span>
                {isHovered && <button type="submit" name="_action" value={actionName}>
                    <X size={12} />
                </button>}
            </div>
        </Badge>
    )
}