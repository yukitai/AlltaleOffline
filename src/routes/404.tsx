export function NotFound(params: {default: boolean}) {
  return (
    <>
      <div class="flex flex-col justify-center items-center h-screen">
        <h1 class="mt-4 text-5xl font-bold">Oppps, it seems something went wrong :(</h1>
        <span class="mt-1 text-md font-light text-gray-500">
          There's nothing at 
          <a href={window.location.pathname} class="ml-2 text-pink-500 underline-none">{window.location.href}</a>
          . You can try to return to
          <a href="/" class="ml-2 text-pink-500 underline-none">home page</a>
          .
        </span>
      </div>
    </>
  )
}
