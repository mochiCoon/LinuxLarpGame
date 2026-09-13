    import { Networking } from "@flamework/networking";

/**
 * Events fired from a client and received on the server.
 */
interface ClientToServerEvents {
    Dostuff: () => void;
}

/**
 * Events fired from the server and received on clients.
 */
interface ServerToClientEvents {}

/**
 * Functions invoked by a client and resolved on the server.
 */
interface ClientToServerFunctions {}

/**
 * Functions invoked by the server and resolved on a client.
 */
interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
