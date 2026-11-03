import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCategory } from "@/app/actions/category";
import { Trash2 } from "lucide-react";
import { listCategoriesNewestFirst } from "@/lib/domain/categories";

export async function CategoriesSettings() {
  const categories = await listCategoriesNewestFirst();

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-medium">分类列表</h3>
           <p className="text-sm text-muted-foreground">自定义您的收入与支出分类。</p>
        </div>
        <CreateCategoryDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 text-base">支出分类</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无支出分类</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                {expenseCategories.map(category => (
                    <form key={category.id} action={deleteCategory.bind(null, category.id)}>
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900">
                            <span className="text-sm font-medium">{category.name}</span>
                            <button className="text-red-400 hover:text-red-600 ml-1">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </form>
                ))}
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 text-base">收入分类</CardTitle>
          </CardHeader>
          <CardContent>
             {incomeCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无收入分类</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                {incomeCategories.map(category => (
                    <form key={category.id} action={deleteCategory.bind(null, category.id)}>
                         <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-900">
                            <span className="text-sm font-medium">{category.name}</span>
                            <button className="text-green-400 hover:text-green-600 ml-1">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </form>
                ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
