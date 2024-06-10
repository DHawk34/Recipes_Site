using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Recipes_API.Models;

namespace Recipes_API.DATA;

public partial class RecipeSiteContext : DbContext
{
    //Scaffold-DbContext "Host=localhost;Port=5432;Database=recipe_site;Username=neo;Password=admin;" Npgsql.EntityFrameworkCore.PostgreSQL -OutputDir "Scaffold" -ContextDir "Scaffold/Context"
    public RecipeSiteContext()
    {
    }

    public RecipeSiteContext(DbContextOptions<RecipeSiteContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<Mealtime> Mealtimes { get; set; }

    public virtual DbSet<NationalCuisine> NationalCuisines { get; set; }

    public virtual DbSet<Recipe> Recipes { get; set; }

    public virtual DbSet<RecipeGroup> RecipeGroups { get; set; }

    public virtual DbSet<RecipeIngredient> RecipeIngredients { get; set; }

    public virtual DbSet<RecipeInstruction> RecipeInstructions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserMenu> UserMenus { get; set; }

    public virtual DbSet<UserRefreshToken> UserRefreshTokens { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=recipe_site;Username=neo;Password=admin;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("images_pk");

            entity.ToTable("images");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ContentType)
                .HasMaxLength(256)
                .HasColumnName("content_type");
            entity.Property(e => e.Data).HasColumnName("data");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_id_ingredient");

            entity.ToTable("ingredients");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(256)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Mealtime>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipe_mealtime_pkey");

            entity.ToTable("mealtime");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(32)
                .HasColumnName("name");
        });

        modelBuilder.Entity<NationalCuisine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("national_cuisine_pk");

            entity.ToTable("national_cuisine");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(128)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipes_pk");

            entity.ToTable("recipes");

            entity.HasIndex(e => e.NationalCuisine, "rec_cuisine");

            entity.HasIndex(e => e.Difficult, "rec_difficult");

            entity.HasIndex(e => e.Group, "rec_group");

            entity.HasIndex(e => e.Hot, "rec_hot");

            entity.HasIndex(e => e.Name, "rec_name");

            entity.HasIndex(e => e.Owner, "rec_owner");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CookTime)
                .HasMaxLength(8)
                .HasColumnName("cook_time");
            entity.Property(e => e.CreationTime)
                .HasConversion(x => x.ToUniversalTime(), x => x.ToLocalTime())
                .HasPrecision(0)
                .HasColumnName("creation_time");
            entity.Property(e => e.Difficult).HasColumnName("difficult");
            entity.Property(e => e.FinishImage).HasColumnName("finish_image");
            entity.Property(e => e.Group).HasColumnName("group");
            entity.Property(e => e.Hot).HasColumnName("hot");
            entity.Property(e => e.Name)
                .HasMaxLength(64)
                .HasColumnName("name");
            entity.Property(e => e.NationalCuisine).HasColumnName("national_cuisine");
            entity.Property(e => e.Owner).HasColumnName("owner");
            entity.Property(e => e.PortionCount).HasColumnName("portion_count");
            entity.Property(e => e.Verified).HasColumnName("verified");

            entity.HasOne(d => d.FinishImageNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.FinishImage)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("recipes_finish_image_fkey");

            entity.HasOne(d => d.GroupNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Group)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("recipes_group_fkey");

            entity.HasOne(d => d.NationalCuisineNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.NationalCuisine)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("recipes_national_cuisine_fkey");

            entity.HasOne(d => d.OwnerNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Owner)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("recipes_owner_fkey");

            entity.HasMany(d => d.Mealtimes).WithMany(p => p.Recipes)
                .UsingEntity<Dictionary<string, object>>(
                    "RecipeMealtime",
                    r => r.HasOne<Mealtime>().WithMany()
                        .HasForeignKey("Mealtime")
                        .HasConstraintName("recipe-mealtime_mealtime_fkey"),
                    l => l.HasOne<Recipe>().WithMany()
                        .HasForeignKey("Recipe")
                        .HasConstraintName("recipe-mealtime_recipe_fkey"),
                    j =>
                    {
                        j.HasKey("Recipe", "Mealtime").HasName("recipe-mealtime_pkey");
                        j.ToTable("recipe-mealtime");
                        j.IndexerProperty<int>("Recipe").HasColumnName("recipe");
                        j.IndexerProperty<int>("Mealtime").HasColumnName("mealtime");
                    });
        });

        modelBuilder.Entity<RecipeGroup>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipe_group_pk");

            entity.ToTable("recipe_group");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(32)
                .HasColumnName("name");
        });

        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Ingredient }).HasName("sqlite_autoindex_recipe-ingredients_1");

            entity.ToTable("recipe-ingredients");

            entity.Property(e => e.Recipe).HasColumnName("recipe");
            entity.Property(e => e.Ingredient).HasColumnName("ingredient");
            entity.Property(e => e.Amount).HasColumnName("amount");

            entity.HasOne(d => d.IngredientNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Ingredient)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("recipe-ingredients_ingredient_fkey");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("recipe-ingredients_recipe_fkey");
        });

        modelBuilder.Entity<RecipeInstruction>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Step }).HasName("sqlite_autoindex_recipe-instructions_1");

            entity.ToTable("recipe-instructions");

            entity.Property(e => e.Recipe)
                .ValueGeneratedOnAdd()
                .HasColumnName("recipe");
            entity.Property(e => e.Step).HasColumnName("step");
            entity.Property(e => e.InstructionImage).HasColumnName("instruction_image");
            entity.Property(e => e.InstructionText).HasColumnName("instruction_text");

            entity.HasOne(d => d.InstructionImageNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.InstructionImage)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("recipe-instructions_instruction_image_fkey");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("recipe-instructions_recipe_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Admin).HasColumnName("admin");
            entity.Property(e => e.Email)
                .HasMaxLength(256)
                .HasColumnName("email");
            entity.Property(e => e.Login)
                .HasMaxLength(32)
                .HasColumnName("login");
            entity.Property(e => e.MenuCuisine).HasColumnName("menu_cuisine");
            entity.Property(e => e.Name)
                .HasMaxLength(32)
                .HasColumnName("name");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.PasswordSalt).HasColumnName("password_salt");
            entity.Property(e => e.PublicId).HasColumnName("public_id");

            entity.HasOne(d => d.MenuCuisineNavigation).WithMany(p => p.Users)
                .HasForeignKey(d => d.MenuCuisine)
                .HasConstraintName("users_menu_cuisine_fkey");

            entity.HasMany(d => d.FavoriteRecipes).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserFavoriteRecipe",
                    r => r.HasOne<Recipe>().WithMany()
                        .HasForeignKey("Recipe")
                        .HasConstraintName("user_favorite_recipe_recipe_fkey"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("User")
                        .HasConstraintName("user_favorite_recipe_user_fkey"),
                    j =>
                    {
                        j.HasKey("User", "Recipe").HasName("user_favorite_recipe_pkey");
                        j.ToTable("user_favorite_recipe");
                        j.IndexerProperty<int>("User").HasColumnName("user");
                        j.IndexerProperty<int>("Recipe").HasColumnName("recipe");
                    });
        });

        modelBuilder.Entity<UserMenu>(entity =>
        {
            entity.HasKey(e => new { e.User, e.Day, e.Mealtime }).HasName("user_menu_pkey");

            entity.ToTable("user_menu");

            entity.Property(e => e.User).HasColumnName("user");
            entity.Property(e => e.Day).HasColumnName("day");
            entity.Property(e => e.Mealtime).HasColumnName("mealtime");
            entity.Property(e => e.Recipe).HasColumnName("recipe");

            entity.HasOne(d => d.MealtimeNavigation).WithMany(p => p.UserMenus)
                .HasForeignKey(d => d.Mealtime)
                .HasConstraintName("user_menu_mealtime_fkey");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.UserMenus)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("user_menu_recipe_fkey");

            entity.HasOne(d => d.UserNavigation).WithMany(p => p.UserMenus)
                .HasForeignKey(d => d.User)
                .HasConstraintName("user_menu_user_fkey");
        });

        modelBuilder.Entity<UserRefreshToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.DeviceId }).HasName("user_refresh_tokens_pkey");

            entity.ToTable("user_refresh_tokens");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.DeviceId).HasColumnName("device_id");
            entity.Property(e => e.CreatedDate)
                .HasConversion(x => x.ToUniversalTime(), x => x.ToLocalTime())
                .HasPrecision(0)
                .HasColumnName("created_date");
            entity.Property(e => e.ExpiresDate)
                .HasConversion(x => x.ToUniversalTime(), x => x.ToLocalTime())
                .HasPrecision(0)
                .HasColumnName("expires_date");
            entity.Property(e => e.TokenHash).HasColumnName("token_hash");

            entity.HasOne(d => d.User).WithMany(p => p.UserRefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_refresh_tokens_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}