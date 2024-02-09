import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

// para ser reconhecida em todas as funções deixamos ela global
let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    // console.log(event.target.textLength);

    setContent(event.target.value)

    if (event.target.textLength === 0) {
      // usei textLength mais podemos usar valeu sem problemas
      setShouldShowOnboarding(true)
    }


  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content) {
      onNoteCreated(content)
      toast.success('Nota salva com Sucesso', {
        description: 'Parabéns você salvou uma nota.'
      })
    } else {
      toast.warning('Atenção', {
        description: 'Não Salvamos notas vazias.',
        duration: 3500
      })
    }

    setContent('')

    setShouldShowOnboarding(true)


  }

  // implementando gravação
  function handleStartRecording() {

    const isSpeechRecogitionAPIAvailable = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

    if (!isSpeechRecogitionAPIAvailable) {
      toast.warning('Alerta', {
        description: 'Infelizmente seu navegador não suporta a API de gravação',
        duration: 3000
      })
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    // inicializando a variável global a api.
    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR' // escolha a linguagem de preferência.
    speechRecognition.continuous = true // fica gravando até eu pedir para para de gravar.
    speechRecognition.maxAlternatives = 1 // podemos definir a quantidade de alternativas caso api não entenda a palavra 'sugestão'
    speechRecognition.interimResults = true // vai trazendo os resultado conforme vai falando e não esperar terminar de falar.

    // essa função vai ser chamada quando api ouvir algo.
    speechRecognition.onresult = (event) => {
      // console.log(event.results);
       // pegando tudo que o usuário falou.
       const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
       }, '')

       setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event);
     
    }

    // se não tiver esse comando ele não inicia a gravação
    speechRecognition.start()

  }

  function handleStopRecording() {
    setIsRecording(false)

    speechRecognition?.stop()
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className='rounded-md bg-slate-700 p-5 flex flex-col text-left gap-3 hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>
          Adicionar nota
        </span>
        <p className='text-sm leading-6 text-slate-400'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50 ' />
        <Dialog.Content className='fixed inset-0 overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5'/>
          </Dialog.Close>
          <form className='flex flex-col flex-1'>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className='text-sm font-medium text-slate-300'>
                Adicionar nota
              </span>
              {
                shouldShowOnboarding ? (
                  <p className='text-sm leading-6 text-slate-400 '>
                    Comece {' '}
                    <button
                      type='button'
                      onClick={handleStartRecording}
                      className='font-medium text-lime-400 hover:underline'
                    >
                      gravando uma nota
                    </button>
                    {' '}
                    em áudio ou se preferir
                    {' '}
                    <button
                      type='button'
                      className='font-medium text-lime-400 hover:underline'
                      onClick={handleStartEditor}
                    >
                      utilize apenas texto
                    </button>.
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    disabled={isRecording}
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                    onChange={handleContentChanged}
                    value={content}
                  />
                )
              }
            </div>

            {isRecording ? (
              <button
                type='button'
                onClick={handleStopRecording}
                className='flex items-center justify-center gap-2 w-full bg-slate-900 py-4 text-center text-sm font-medium text-slate-300 outline-none hover:text-slate-100'
              >
                <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                Gravando! (clique para interromper)
              </button>
            ) : (
              <button
                type='button'
                onClick={handleSaveNote}
                className=' w-full bg-lime-400 py-4 text-center text-sm font-medium text-lime-950 outline-none hover:bg-lime-500'
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

  )
}