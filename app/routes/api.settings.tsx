import { LoaderArgs, json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node"; // or cloudflare/deno
import { settingEntity } from "~/domain/setting/setting.entity.server";
import { settingPrismaEntity } from "~/domain/setting/setting.prisma.entity.server";
import { prismaIt } from "~/lib/prisma/prisma-it.server";
import getSearchParam from "~/utils/get-search-param";
import { badRequest, ok, serverError } from "~/utils/http-response.server";


/**
 * NOTE:
 *
 * to solve CORS issue I installed the "cors" package and used it in server.js
 */

// handle GET request
export async function loader({ request, params }: LoaderArgs) {

    const context = getSearchParam({ request, paramName: "context" })

    if (context === "cardapio-pizza-taglio") {
        const [err, options] = await prismaIt(settingPrismaEntity.findAllByContext("cardapio-pizza-taglio"))

        if (err) {
            return serverError(err)
        }

        const sabores = options[0]?.value

        // return ok({ sabores })
        return json(
            {
                status: 200,
                payload: sabores
            },
            {
                headers: {
                    'Content-Security-Policy': "connect-src 'self' https://*.whatsapp.net https://amodomio.com.br https://www.facebook.com blob: https://crashlogs.whatsapp.net/wa_clb_data https://crashlogs.whatsapp.net/wa_fls_upload_check wss://*.web.whatsapp.com wss://web.whatsapp.com wss://web-fallback.whatsapp.com https://www.whatsapp.com https://dyn.web.whatsapp.com https://graph.whatsapp.com/graphql/ https://graph.facebook.com/graphql ws://web.whatsapp.com wss://web.whatsapp.com:5222 data: https://*.tenor.co https://*.giphy.com https://maps.googleapis.com https://*.google-analytics.com",
                },
            }
        );

    }

    return ok()
}


// handle POST request
export async function action({ request }: ActionArgs) {


    const body = await request.json();
    const action = body?.action
    const secretKey = body?.secret


    if (!secretKey || secretKey !== process.env.REST_API_SECRET_KEY) {
        return ok()
    }

    if (action === "cardapio-pizza-taglio-upsert") {

        const [err, record] = await prismaIt(settingPrismaEntity.updateOrCreate({
            context: "cardapio-pizza-taglio",
            value: body?.value,
            type: "string",
            name: "browser-extension-content",
            createdAt: new Date().toISOString(),
        }))

        if (err) {
            return serverError('Erro ao salvar configuração')
        }

        return ok(record)

    }



    return ok({})
};
