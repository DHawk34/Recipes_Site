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
            entity.Property(e => e.ContentType).HasColumnName("content_type");
            entity.Property(e => e.Data).HasColumnName("data");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_id_ingredient");

            entity.ToTable("ingredients");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
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
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipes_pk");

            entity.ToTable("recipes");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CookTime).HasColumnName("cook_time");
            entity.Property(e => e.CreationTime)
                .HasConversion(x => x.ToUniversalTime(), x => x.ToLocalTime())
                .HasPrecision(0)
                .HasColumnName("creation_time");
            entity.Property(e => e.Difficult).HasColumnName("difficult");
            entity.Property(e => e.FinishImage).HasColumnName("finish_image");
            entity.Property(e => e.Group).HasColumnName("group");
            entity.Property(e => e.Hot).HasColumnName("hot");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.NationalCuisine).HasColumnName("national_cuisine");
            entity.Property(e => e.Owner).HasColumnName("owner");
            entity.Property(e => e.PortionCount).HasColumnName("portion_count");

            entity.HasOne(d => d.FinishImageNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.FinishImage)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe_group_images_0");

            entity.HasOne(d => d.GroupNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Group)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe_group_recipe_group_1");

            entity.HasOne(d => d.NationalCuisineNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.NationalCuisine)
                .HasConstraintName("fk_recipe_group_national_cuisine_2");

            entity.HasOne(d => d.OwnerNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Owner)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("recipes_owner_fkey");

            entity.HasMany(d => d.Mealtimes).WithMany(p => p.Recipes)
                .UsingEntity<Dictionary<string, object>>(
                    "RecipeMealtime",
                    r => r.HasOne<Mealtime>().WithMany()
                        .HasForeignKey("Mealtime")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("recipe-mealtime_mealtime_fkey"),
                    l => l.HasOne<Recipe>().WithMany()
                        .HasForeignKey("Recipe")
                        .OnDelete(DeleteBehavior.ClientSetNull)
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
            entity.Property(e => e.Name).HasColumnName("name");
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
                .HasConstraintName("fk_ingredient");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("fk_recipe");
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
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe-ingredients_images_0");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("fk_recipe-ingredients_recipes_1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(256)
                .HasColumnName("email");
            entity.Property(e => e.Login)
                .HasMaxLength(32)
                .HasColumnName("login");
            entity.Property(e => e.Name)
                .HasMaxLength(32)
                .HasColumnName("name");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.PasswordSalt).HasColumnName("password_salt");
            entity.Property(e => e.PublicId).HasColumnName("public_id");
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