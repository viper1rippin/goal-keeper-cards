
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTextEditorProps {
  projectId: string;
  userId: string;
}

export const ProjectTextEditor = ({ projectId, userId }: ProjectTextEditorProps) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your project notes here...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    autofocus: false,
    editable: true,
  });

  // Load saved content when component mounts
  useEffect(() => {
    const loadContent = async () => {
      if (!projectId || !userId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('project_notes')
          .select('content')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setContent(data.content);
          editor?.commands.setContent(data.content);
        }
      } catch (error) {
        console.error('Error loading editor content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your project notes.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (editor) {
      loadContent();
    }
  }, [projectId, userId, editor]);

  // Save content to database
  const saveContent = async () => {
    if (!projectId || !userId || !editor) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('project_notes')
        .upsert({
          project_id: projectId,
          user_id: userId,
          content: editor.getHTML(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Your project notes have been saved.',
      });
    } catch (error) {
      console.error('Error saving editor content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your project notes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save content every 10 seconds if changes detected
  useEffect(() => {
    if (!editor || isLoading) return;
    
    const interval = setInterval(() => {
      if (editor.isEmpty) return;
      
      if (content !== editor.getHTML()) {
        saveContent();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [editor, isLoading, content]);

  if (isLoading) {
    return (
      <Card className="mt-12 bg-card border-border shadow-lg">
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-12 bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Project Notes</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveContent}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <div className="flex gap-1 pt-3">
          <MenuButton 
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </MenuButton>
          
          <MenuButton 
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </MenuButton>
          
          <MenuButton 
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </MenuButton>
          
          <MenuButton 
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </MenuButton>
          
          <div className="border-l border-border mx-1" />
          
          <MenuButton 
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </MenuButton>
          
          <MenuButton 
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </MenuButton>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-[300px] max-h-[600px] overflow-y-auto p-6 prose prose-invert prose-emerald max-w-none w-full">
          <EditorContent editor={editor} className="outline-none" />
        </div>
      </CardContent>
    </Card>
  );
};

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

const MenuButton = ({ onClick, isActive, disabled, children, title }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-colors",
        isActive 
          ? "bg-muted text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title={title}
    >
      {children}
    </button>
  );
};
