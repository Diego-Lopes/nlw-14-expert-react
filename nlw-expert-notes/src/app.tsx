import { ChangeEvent, useState } from 'react'
import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'
import { toast } from 'sonner'

interface NotesProps {
  id: string,
  data: Date,
  content: string
}

export function App() {
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState<NotesProps[]>(() => {
    const notesOnStorage = localStorage.getItem('notes')

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage)
    }

    return []
  })

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      data: new Date(),
      content
    }

    setNotes((state) => {
      localStorage.setItem('notes', JSON.stringify([newNote, ...state]))

      return [newNote, ...state]
    })

  }

  function onNoteDeleted(id: string) {
    const noteArray = notes.filter(note => note.id !== id)

    setNotes(noteArray)
    localStorage.setItem('notes', JSON.stringify(noteArray))

    toast.success('Nota Deletada com Sucesso', {
      duration: 3000
    })
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value


    setSearch(query)
  }

  const filteredNotes = search !== ''
    ? notes.filter(note => note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    : notes

  return (
    <div className='mx-auto max-w-6xl my-12 space-y-6 px-5 '>
      <img src={logo} alt="nlw expert" />

      <form className='w-full'>
        <input
          type="text"
          placeholder='Busque em suas notas'
          className='w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-500'
          onChange={handleSearch}
        />
      </form>
      <div className='h-px bg-slate-700' />

      <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 auto-rows-[250px] gap-6 '>
        {
          search === ''
            ?
            (
              <>
                <NewNoteCard onNoteCreated={onNoteCreated} />
                {
                  filteredNotes.map((Note) => {
                    return (
                      <NoteCard key={Note.id} note={Note} onNoteDeleted={onNoteDeleted} />
                    )
                  })
                }
              </>
            )
            : (
              <>
                {
                  filteredNotes.map((Note) => {
                    return (
                      <NoteCard key={Note.id} note={Note} onNoteDeleted={onNoteDeleted} />
                    )
                  })
                }
              </>
            )
        }

        {
          filteredNotes.length === 0 && search !== '' && (

            <NewNoteCard onNoteCreated={onNoteCreated} />

          )

        }
      </div>
    </div>
  )
}

