import { MenuItemTag, Tag } from "@prisma/client";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { HeadersFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation, useSearchParams } from "@remix-run/react";
import { LayoutList } from "lucide-react";
import { LayoutTemplate } from "lucide-react";
import { ArrowRight, Filter, Instagram, MapPin, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ItalyFlag from "~/components/italy-flag/italy-flag";
import Badge from "~/components/primitives/badge/badge";
import ExternalLink from "~/components/primitives/external-link/external-link";
import Logo from "~/components/primitives/logo/logo";
import WhatsappExternalLink from "~/components/primitives/whatsapp/whatsapp-external-link";
import WhatsAppIcon from "~/components/primitives/whatsapp/whatsapp-icon";
import TextSlideInUp from "~/components/text-slide-in-up/text-slide-in-up";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { toast } from "~/components/ui/use-toast";
import CardapioItemDialog from "~/domain/cardapio/components/cardapio-item-dialog/cardapio-item-dialog";
import FazerPedidoButton from "~/domain/cardapio/components/fazer-pedido-button/fazer-pedido-button";
import { menuItemTagPrismaEntity } from "~/domain/cardapio/menu-item-tags.prisma.entity.server";
import { MenuItemWithAssociations, menuItemPrismaEntity } from "~/domain/cardapio/menu-item.prisma.entity.server";
import BadgeTag from "~/domain/tags/components/badge-tag";
import { tagPrismaEntity } from "~/domain/tags/tag.prisma.entity.server";
import { WebsiteNavigationSidebar } from "~/domain/website-navigation/components/website-navigation-sidebar";
import GLOBAL_LINKS from "~/domain/website-navigation/global-links.constant";
import PUBLIC_WEBSITE_NAVIGATION_ITEMS from "~/domain/website-navigation/public/public-website.nav-links";
import useStoreOpeningStatus from "~/hooks/use-store-opening-status";
import { prismaAll } from "~/lib/prisma/prisma-all.server";
import { prismaIt } from "~/lib/prisma/prisma-it.server";
import { cn } from "~/lib/utils";
import getSearchParam from "~/utils/get-search-param";
import { badRequest, ok } from "~/utils/http-response.server";


/**
 * TODO:
 * - [x] Add to menu Horario Atendimento
 * - [x] Add to menu link instagram
 * - [] Add customer comments, from a copia incolla operation
 * - [] Add to menu link fazer pedido
 * - [] Add to menu "como funciona"
 * - [] Like it bounded to product sells
 * - [x] Different layouts
 * - [] Fechamento Horario Atendimento no botao de fazer pedido
 * - [] Session feature
 * - [x] Like it feature
 * - [x] Share it feature
 * - [] Notification feature
 * - [] Let install it wpapp
 * - [] Me sinto fortunado (choose a random menu item)
 * - [] Cache https://vercel.com/docs/frameworks/remix
 */

export interface CardapioOutletContext {
    items: MenuItemWithAssociations[]
}

export const meta: V2_MetaFunction = ({ data }) => {
    return [
        { title: "Cardápio A Modo Mio - Pizzaria Italiana em Pato Branco" },
        { name: "description", content: "É a pizza! Italiana! Um sabor que você nunca experimentou! Descubra no nosso cardápio as melhores pizzas da cidade. Experimente e saboreie a verdadeira italianidade em Pato Branco." },
        { name: "og:title", content: "Cardápio A Modo Mio - Pizzaria Italiana em Pato Branco" },
        { name: "og:description", content: "É a pizza! Italiana! Um sabor que nunca experimentou! Descubra no nosso cardápio as melhores pizzas da cidade. Experimente e saboreie a verdadeira italianidade em Pato Branco." },
        { name: "og:image", content: "https://www.amodomio.com.br/images/cardapio_og_image.jpg" },
        { name: "og:url", content: "https://www.amodomio.com.br/cardapio" },
        { name: "og:site_name", content: "Cardápio A Modo Mio - Pizzaria Italiana em Pato Branco" },
        { name: "og:type", content: "website" },
    ];
};






export default function CardapioWeb() {
    const location = useLocation()


    // // synchronize initially
    // useLayoutEffect(() => {
    //     setStoredValue("sidebar")
    // }, []);

    // synchronize on change
    // useEffect(() => {
    //     window.localStorage.setItem("sidebar", isOpen);
    // }, [isOpen]);

    return (
        <>
            <CardapioHeader />

            <div className="md:m-auto md:max-w-2xl">
                <section className="mt-28 p-4 mb-4 ">
                    <div className="flex flex-col font-body-website">
                        <h2 className="font-semibold text-lg">A Modo Mio | Pizzeria Italiana</h2>
                        <h3 className="text-muted-foreground">Pizza Al Taglio & Delivery</h3>
                    </div>

                    <div className="text-xs text-muted-foreground mb-6 font-body-website">
                        <p>Rua Arariboia 64 - Pato Branco</p>
                    </div>
                    <div className="grid grid-cols-3 gap-x-4">

                        <Link to={GLOBAL_LINKS.instagram.href} aria-label={GLOBAL_LINKS.instagram.title} className="flex items-center justify-center gap-1 rounded-lg bg-muted py-1">
                            <Instagram />
                            <span className="font-semibold text-xs">Instagram</span>
                        </Link>
                        <WhatsappExternalLink
                            phoneNumber="46991272525"
                            ariaLabel="Envia uma mensagem com WhatsApp"
                            message={"Olá, gostaria fazer um pedido"}
                            className="flex items-center justify-center gap-2 rounded-lg bg-muted py-1 "
                        >
                            <WhatsAppIcon color="black" />
                            <span className="font-semibold text-xs">WhatsApp</span>
                        </WhatsappExternalLink>
                        <Link to={GLOBAL_LINKS.maps.href} aria-label={GLOBAL_LINKS.maps.title} className="flex items-center justify-center gap-1 rounded-lg bg-muted py-1">
                            <MapPin />
                            <span className="font-semibold text-xs">Maps</span>
                        </Link>
                    </div>
                </section>

                <div className="grid grid-cols-10 rounded-lg bg-muted m-4 p-2">
                    <div className="flex items-center justify-center col-span-1">
                        <ItalyFlag width={24} />
                    </div>
                    <p className="font-body-website text-sm col-span-8 text-center">Todas os nossas pizzas são preparadas com <span className="font-semibold">farinha e molho de tomate importados da Itália</span></p>
                    <div className="flex items-center justify-center col-span-1">
                        <ItalyFlag width={24} />
                    </div>
                </div>

                <div className="flex gap-4 justify-center mb-2">
                    <Link to={"/cardapio"} className={
                        cn(
                            "p-2",
                            location.pathname === "/cardapio" && "border-b-brand-blue border-b-2",

                        )
                    } >
                        <LayoutTemplate />
                    </Link>
                    <Link to={"/cardapio/list"} className={
                        cn(
                            "p-2",
                            location.pathname === "/cardapio/list" && "border-b-brand-blue border-b-2",

                        )
                    } >
                        <LayoutList />
                    </Link>
                </div>

                {/* <Featured /> */}
                <Outlet
                />

            </div>

            <CardapioFooter />
        </>
    )
}

interface CardapioHeaderProps {
    tags?: Tag[]
}

function CardapioHeader({ tags }: CardapioHeaderProps) {
    const [showSearch, setShowSearch] = useState(false)

    return (
        <header className="fixed top-0 w-screen z-50 md:max-w-2xl md:-translate-x-1/2 md:left-1/2" >
            <div className="flex flex-col bg-brand-blue px-4 pt-2 py-1">
                <div className="grid grid-cols-3 items-center w-full">
                    {/* <div className="flex gap-1 items-center" onClick={() => setShowSearch(!showSearch)}>
                        <HamburgerMenuIcon className="w-6 h-6" />
                        <span className="font-body-website text-[10px] font-semibold  uppercase">Menu</span>
                    </div> */}

                    <WebsiteNavigationSidebar
                        homeLink={{ label: GLOBAL_LINKS.cardapioPublic.title, to: GLOBAL_LINKS.cardapioPublic.href }}
                        navigationLinks={PUBLIC_WEBSITE_NAVIGATION_ITEMS}
                        buttonTrigger={{
                            label: "Menu",
                            classNameLabel: "block font-body-website text-[10px] font-semibold  uppercase text-white",
                            classNameButton: "justify-start w-full h-full",
                            colorIcon: "white",
                        }}
                    >
                        <div className="flex flex-col justify-center mb-2 font-body-website">
                            <p className=" font-semibold text-sm leading-relaxed">Hórarios de funcionamento</p>
                            <div className="flex flex-col justify-center mb-4">
                                <p className="text-muted-foreground font-body-website">Quarta - Domingo</p>
                                <p className="text-muted-foreground font-body-website">18:00 - 22:00</p>
                            </div>
                        </div>


                        <div className="pr-4 mb-4">
                            <FazerPedidoButton cnLabel="text-xs" />
                        </div>

                    </WebsiteNavigationSidebar>

                    <Link to={GLOBAL_LINKS.cardapioPublic.href} className="flex justify-center">
                        <Logo color="white" className="w-[60px]" tagline={false} />
                    </Link>
                    <div className="flex justify-end items-center cursor-pointer" onClick={() => setShowSearch(!showSearch)}>
                        <SearchIcon color="white" />
                        <span className="font-body-website text-[10px] font-semibold  uppercase text-white">Pesquisar</span>
                    </div>
                </div>

            </div>


            {/* <FiltersTags tags={tags} /> */}
        </header>
    )
}

function FiltersTags({ tags }: { tags: Tag[] }) {

    const [searchParams, setSearchParams] = useSearchParams()
    const tagFilter = searchParams.get("tag")

    return (

        <div className="relative bg-white">
            <div className="w-full overflow-x-auto" >
                <ul className="py-3 px-2" style={{
                    display: "-webkit-inline-box"
                }}>
                    <Link to={`/cardapio`} className="text-xs font-body-website font-semibold uppercase text-muted-foreground">
                        <Badge className={
                            cn(
                                "bg-none border border-brand-blue text-brand-blue font-semibold",
                                tagFilter === null && "bg-brand-blue text-white scale-110"
                            )
                        }>Todos</Badge>
                    </Link>
                    {tags.map((tag) => (
                        <li key={tag.id} className="ml-2">
                            <Link to={`?tag=${tag.name}`} className="text-xs font-body-website font-semibold uppercase text-muted-foreground">
                                <BadgeTag tag={tag}
                                    classNameLabel={
                                        cn(
                                            "text-[10px] text-brand-blue",
                                            tagFilter === tag.name && "text-white"
                                        )
                                    } tagColor={false}
                                    classNameContainer={
                                        cn(
                                            "bg-none border border-brand-blue",
                                            tagFilter === tag.name && "bg-brand-blue",
                                            tagFilter === tag.name && " scale-110"

                                        )
                                    } />
                            </Link>
                        </li>
                    ))}


                </ul>
            </div>
            {
                tagFilter && (
                    <div className="absolute top-12 left-0 right-0 flex gap-2 items-center px-2 bg-blue-300 py-[0.15rem]">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex gap-1 items-center">
                                <Filter size={12} />
                                <p className="font-body-website text-[12px]">Você está visualizando os sabores <span className="font-semibold">"{tagFilter}"</span></p>
                            </div>
                            <Link to={`/cardapio`} className="font-body-website text-[12px] underline font-semibold self-end">
                                Voltar
                            </Link>
                        </div>
                    </div>
                )
            }
        </div>


    )
}



function CardapioFooter() {

    const labels = ["cyuc", "HORÁRIO DE ATENDIMENTO", "QUA-DOM 18:00-22:00"];


    return (
        <div className={
            cn(
                "fixed bottom-0 w-screen md:max-w-2xl md:-translate-x-1/2 md:left-1/2 ",
            )
        }>
            <footer >
                <div className="h-full w-full py-2 px-4 bg-white">
                    <FazerPedidoButton variant="primary" />
                </div>
            </footer>
        </div>

    )
}

