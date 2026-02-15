/**
 * @file Collections.tsx
 *
 * Displays the player's collected items organized into tabbed categories:
 * toys, outfits, room themes, and decorations. Each item card is styled
 * by rarity tier (common, rare, epic, legendary) and optionally shows a
 * passive stat bonus. Uses the CollectionGrid sub-component for rendering
 * each category's grid with an empty-state fallback.
 */
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollectionItem } from '@/types/game';
import { cn } from '@/lib/utils';
import { Package, Shirt, Armchair, Sparkles, Lock } from 'lucide-react';

/** Renders a responsive grid of collection items, or an empty-state placeholder. */
const CollectionGrid: React.FC<{ items: CollectionItem[], emptyMessage: string }> = ({ items, emptyMessage }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Package className="w-12 h-12 mb-3 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          // Border and background color are determined by rarity tier
          className={cn(
            "group relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300",
            "bg-card hover:shadow-md hover:border-primary/30",
            item.rarity === 'legendary' ? "border-amber-500/30 bg-amber-500/5" :
            item.rarity === 'epic' ? "border-purple-500/30 bg-purple-500/5" :
            item.rarity === 'rare' ? "border-blue-500/30 bg-blue-500/5" :
            "border-border/50"
          )}
        >
          <div className="text-4xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
            {item.icon}
          </div>
          <div className="text-center w-full">
            <h4 className="font-semibold text-sm truncate w-full" title={item.name}>{item.name}</h4>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 h-8 leading-tight">
              {item.description}
            </p>
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] h-5 px-1.5 capitalize border-0",
                item.rarity === 'legendary' ? "bg-amber-500/20 text-amber-600" :
                item.rarity === 'epic' ? "bg-purple-500/20 text-purple-600" :
                item.rarity === 'rare' ? "bg-blue-500/20 text-blue-600" :
                "bg-slate-500/20 text-slate-600"
              )}
            >
              {item.rarity}
            </Badge>
          </div>
          
          {item.passiveEffect && (
            <div className="mt-2 w-full pt-2 border-t border-border/50 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>+{item.passiveEffect.bonus} {item.passiveEffect.stat}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Collections: React.FC = () => {
  const { state } = useGame();
  
  // Filter collections by category
  const toys = state.collection.filter(item => item.category === 'toy');
  const outfits = state.collection.filter(item => item.category === 'outfit');
  const themes = state.collection.filter(item => item.category === 'room_theme');
  const decorations = state.collection.filter(item => item.category === 'decoration');

  return (
    <Card className="h-full border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="font-serif text-2xl">My Collection</CardTitle>
        <CardDescription>
          Collect rare items, outfits, and themes for your pet!
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="toys" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/40 p-1">
            <TabsTrigger value="toys" className="flex-1">Toys ({toys.length})</TabsTrigger>
            <TabsTrigger value="outfits" className="flex-1">Outfits ({outfits.length})</TabsTrigger>
            <TabsTrigger value="themes" className="flex-1">Themes ({themes.length})</TabsTrigger>
            <TabsTrigger value="decor" className="flex-1">Decor ({decorations.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-320px)] pr-4">
            <TabsContent value="toys" className="mt-0">
              <CollectionGrid 
                items={toys} 
                emptyMessage="No toys collected yet. Visit the shop or complete achievements!" 
              />
            </TabsContent>
            
            <TabsContent value="outfits" className="mt-0">
              <CollectionGrid 
                items={outfits} 
                emptyMessage="No outfits collected yet. Dress up your pet!" 
              />
            </TabsContent>
            
            <TabsContent value="themes" className="mt-0">
              <CollectionGrid 
                items={themes} 
                emptyMessage="No room themes collected yet. Customize your space!" 
              />
            </TabsContent>
            
            <TabsContent value="decor" className="mt-0">
              <CollectionGrid 
                items={decorations} 
                emptyMessage="No decorations collected yet." 
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Collections;
