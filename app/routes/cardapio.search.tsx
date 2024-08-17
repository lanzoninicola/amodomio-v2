import { LoaderFunctionArgs } from "@remix-run/node"
import { XIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"

import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import CardapioItemDialog from "~/domain/cardapio/components/cardapio-item-dialog/cardapio-item-dialog"
import { MenuItemWithAssociations, menuItemPrismaEntity } from "~/domain/cardapio/menu-item.prisma.entity.server"
import { tagPrismaEntity } from "~/domain/tags/tag.prisma.entity.server"
import { prismaIt } from "~/lib/prisma/prisma-it.server"
import { badRequest, ok } from "~/utils/http-response.server"

export async function loader({ request }: LoaderFunctionArgs) {
    const env = process.env?.NODE_ENV
    console.log(" =========== executing loader cardapio.search")

    // const tagParam = getSearchParam({ request, paramName: 'tag' })

    //@ts-ignore
    const itemsQuery = prismaIt(menuItemPrismaEntity.findAll({
        where: {
            visible: true,
            // tags: {
            //     some: {
            //         Tag: {
            //             name: tagParam || undefined
            //         }
            //     }
            // }
        },
        option: {
            sorted: true,
            direction: "asc"
        },
        // mock: env === "development"
    }, {
        imageTransform: true,
        imageScaleWidth: 375
    }))




    const tagsQuery = prismaIt(tagPrismaEntity.findAll({
        public: true
    }))

    const results = await Promise.all([itemsQuery, tagsQuery])

    const [errItems, items] = results[0]
    const [errTags, tags] = results[1]

    if (errItems) {
        return badRequest(errItems)
    }


    return ok({
        items, tags
    })


}

export default function CardapioSearch({ items, setShowSearch }: {
    items: MenuItemWithAssociations[],
    setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
}) {

    const [currentItems, setCurrentItems] = useState<MenuItemWithAssociations[]>([]);
    const [search, setSearch] = useState("")
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {

        const value = event.target.value.toLowerCase();
        setSearch(value);

        if (!value) {
            setCurrentItems([]);
            return;
        }


        const itemsFounded = items.filter(item =>
            item.name.toLowerCase().includes(value) ||
            item.ingredients.toLowerCase().includes(value) ||
            item.description.toLowerCase().includes(value) ||
            (item.tags?.public && item.tags?.public.filter(tag => tag.toLowerCase().includes(value)).length > 0)
        );



        setCurrentItems(itemsFounded);
    };



    return (
        <div className="bg-white flex flex-col py-2 px-4 rounded-sm shadow-lg w-[350px] md:w-[450px]">
            <div className=" flex flex-col py-3">

                <div className="max-h-[350px] overflow-y-auto">
                    <ul className="flex flex-col gap-2">
                        {currentItems.map((item) => (
                            <CardapioItemDialog key={item.id} item={item} triggerComponent={
                                <li className="grid grid-cols-8 py-1" >

                                    <div className="self-start bg-center bg-cover bg-no-repeat w-8 h-8 rounded-lg col-span-1 "
                                        style={{
                                            backgroundImage: `url(${item.MenuItemImage?.thumbnailUrl || "/images/cardapio-web-app/placeholder.png"})`,
                                        }}></div>
                                    <div className="flex flex-col col-span-7">
                                        <span className="font-body-website text-[0.85rem] font-semibold leading-tight uppercase text-left">{item.name}</span>
                                        <span className="font-body-website text-[0.85rem] leading-tight text-left">{item.ingredients}</span>
                                    </div>

                                </li>
                            } />

                        ))}
                    </ul>
                </div>

                <Separator className="my-4" />

                {
                    search && <p className="font-body-website text-xs text-muted-foreground mb-2">{currentItems.length} de {items.length} resultados para
                        <span className="font-semibold"> {search}</span>
                    </p>
                }

                <Input
                    ref={inputRef}
                    placeholder="Digitar 'abobrinha' ou 'vegetarianas'" className="font-body-website text-sm h-8" onChange={handleSearch}

                />


            </div>

            <Button type="button" variant="secondary" onClick={() => setShowSearch(false)}>
                <div className="flex gap-2 items-center font-body-website tracking-wide text-xs font-semibold uppercase">
                    <XIcon className="w-[12px] h-[12px]" />
                    <span className="text-[12px] tracking-widest font-semibold uppercase" style={{
                        lineHeight: "normal",
                    }}>Fechar</span></div>
            </Button>


        </div>
    )


}