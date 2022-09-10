export function Upload(params: {path: string}) {
  return (
    <>
      <div class="flex flex-col justify-center items-center h-screen">
        <h1 class="text-3xl font-bold mb-8">Upload Spectrum Guide</h1>
        <div class="w-full mb-4">
          <label class="mr-2 inline-block w-1/2 text-right">Music File</label>
          <a href="javascript:void(0)" class="ml-2 p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500">Select</a>
        </div>
        <div class="w-full mb-4">
          <label class="mr-2 inline-block w-1/2 text-right">Spectrum File</label>
          <a href="javascript:void(0)" class="ml-2 p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500">Select</a>
        </div>
        <div>
          <a href="javascript:void(0)" class="mr-4 p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500">Upload</a>
          <a href="/" class="ml-4 p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500">Cancel</a>
        </div>
      </div>
      <input class="hidden" type="file" name="audio" />
      <input class="hidden" type="file" name="spectrum" />
    </>
  )
}